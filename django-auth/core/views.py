import datetime
from urllib import response

from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView

from core.authentication import JWTAuthentication, create_access_token, create_refresh_token, decode_refresh_token

from .models import User, UserToken
from .serializers import UserSerializer

ACCESS_TOKEN = "token"
REFRESH_TOKEN = "refresh_token"


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

        access_token = create_access_token(user.id)  # type: ignore
        refresh_token = create_refresh_token(user.id)  # type: ignore

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

        if not UserToken.objects.filter(
            user_id=user_id, token=refresh_token, expired_at__gt=datetime.datetime.utcnow()
        ).exists():
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
