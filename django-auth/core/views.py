import random
import string

import pyotp
from django.core.mail import send_mail
from django.utils import timezone
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from core.authentication import JWTAuthentication, create_access_token, create_refresh_token, decode_refresh_token

from .models import Reset, User, UserToken
from .serializers import UserSerializer

ACCESS_TOKEN = "token"
REFRESH_TOKEN = "refresh_token"
RESET_TOKEN_LENGTH = 10
RESET_EMAIL_FROM = "example@mail.com"


class RegisterAPIView(APIView):
    def post(self, request):

        data = request.data

        if data["password"] != data["password_confirm"]:
            raise APIException("Passwords do not match")

        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)


class LoginAPIView(APIView):
    def post(self, request):
        email = request.data["email"]
        password = request.data["password"]

        user = User.objects.filter(email=email).first()

        if not user:
            raise AuthenticationFailed("Invalid credentials")

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid credentials")

        if user.tfa_secret:
            return Response({"id": user.id})  # type: ignore

        secret = pyotp.random_base32()
        otpauth_url = pyotp.totp.TOTP(secret).provisioning_uri(issuer_name="My app")

        return Response({"id": user.id, "secret": secret, "otpauth_url": otpauth_url})  # type: ignore


class TwoFactorAPIView(APIView):
    def post(self, request):
        user_id = request.data["id"]

        user = User.objects.filter(pk=user_id).first()

        if not user:
            raise AuthenticationFailed("Invalid credentials")

        secret = user.tfa_secret or request.data["secret"]

        if not pyotp.TOTP(secret).verify(request.data["code"]):
            raise AuthenticationFailed("Invalid credentials")

        if not user.tfa_secret:
            user.tfa_secret = secret
            user.save()

        access_token = create_access_token(user_id)  # type: ignore
        refresh_token = create_refresh_token(user_id)  # type: ignore

        response = Response()

        response.set_cookie(key=REFRESH_TOKEN, value=refresh_token, httponly=True)

        response.data = {
            ACCESS_TOKEN: access_token,
        }

        return response


class UserAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user

        return Response(UserSerializer(user).data)


class RefreshAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_TOKEN)

        user_id = decode_refresh_token(refresh_token)

        if not UserToken.objects.filter(user_id=user_id, token=refresh_token, expired_at__gt=timezone.now()).exists():
            raise AuthenticationFailed("unauthenticated")

        access_token = create_access_token(user_id)

        return Response({ACCESS_TOKEN: access_token})


class LogoutAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_TOKEN)
        UserToken.objects.filter(token=refresh_token).delete()
        response = Response()
        response.delete_cookie(key=REFRESH_TOKEN)

        response.data = {"message": "success"}

        return response


class LogoutAllSessionsAPIView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_TOKEN)

        user_token = UserToken.objects.filter(token=refresh_token).first()

        if user_token:
            user_id = user_token.user_id
            UserToken.objects.filter(user_id=user_id).delete()

        response = Response()
        response.delete_cookie(key=REFRESH_TOKEN)

        response.data = {"message": "success"}

        return response


class ForgotAPIView(APIView):
    def post(self, request):
        email = request.data["email"]

        token = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(RESET_TOKEN_LENGTH))

        Reset.objects.create(email=email, token=token)

        reset_url = "http://localhost:4200/reset/" + token

        # TODO Send a message to the email
        send_mail(
            subject="Reset your password",
            message=f'Please click <a href="{reset_url}">here></a> to reset you password',
            from_email=RESET_EMAIL_FROM,
            recipient_list=[
                email,
            ],
        )

        return Response({"message": "success"})


class ResetAPIView(APIView):
    def post(self, request):
        data = request.data

        if data["password"] != data["password_confirm"]:
            raise APIException("Passwords do not match")

        reset_info = Reset.objects.filter(token=data["token"]).first()

        if not reset_info:
            raise APIException("Invalid link")

        user = User.objects.filter(email=reset_info.email).first()

        if not user:
            raise APIException("User not found")

        user.set_password(data["password"])
        user.save()

        return Response({"message": "success"})


class GoogleAuthAPIView(APIView):
    def post(self, request):
        token = request.data["token"]
        googleUser = id_token.verify_token(token, GoogleRequest())

        if not googleUser:
            raise AuthenticationFailed("unauthenticated")

        user = User.objects.filter(email=googleUser["email"]).first()

        if not user:
            user = User.objects.create(
                first_name=googleUser["given_name"], last_name=googleUser["family_name"], email=googleUser["email"]
            )
            user.set_password(token)
            user.save()

        user_id = user.id  # type: ignore

        access_token = create_access_token(user_id)  # type: ignore
        refresh_token = create_refresh_token(user_id)  # type: ignore

        response = Response()

        response.set_cookie(key=REFRESH_TOKEN, value=refresh_token, httponly=True)

        response.data = {
            ACCESS_TOKEN: access_token,
        }

        return response
