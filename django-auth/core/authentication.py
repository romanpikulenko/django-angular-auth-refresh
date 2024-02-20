import datetime

import jwt
import pytz
from django.utils import timezone
from django.utils.timezone import make_aware
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from core.models import User, UserToken


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode("utf-8")
            user_id = decode_access_token(token)
            user = User.objects.get(id=user_id)

            return (user, None)

        raise AuthenticationFailed("Unauthenticated")


def create_access_token(id):
    now = timezone.now()

    token = jwt.encode(
        {"user_id": id, "exp": now + datetime.timedelta(seconds=30), "iat": now}, "access_secret", algorithm="HS256"
    )

    return token


def create_refresh_token(id):
    now = timezone.now()
    expired_at = now + datetime.timedelta(days=7)

    token = jwt.encode({"user_id": id, "exp": expired_at, "iat": now}, "refresh_secret", algorithm="HS256")

    UserToken.objects.create(
        user_id=id,
        token=token,
        expired_at=expired_at,
    )

    return token


def decode_access_token(token):
    try:
        payload = jwt.decode(token, "access_secret", algorithms=["HS256"])

        return payload["user_id"]
    except:
        raise AuthenticationFailed("unauthenticated")


def decode_refresh_token(token):
    try:
        payload = jwt.decode(token, "refresh_secret", algorithms=["HS256"])

        return payload["user_id"]
    except:
        raise AuthenticationFailed("unauthenticated")
