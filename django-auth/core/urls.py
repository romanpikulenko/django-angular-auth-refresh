from django.urls import path

from core import views

urlpatterns = [
    path("register/", views.RegisterAPIView.as_view()),
    path("login/", views.LoginAPIView.as_view()),
    path("two-factor/", views.TwoFactorAPIView.as_view()),
    path("google-auth/", views.GoogleAuthAPIView.as_view()),
    path("user/", views.UserAPIView.as_view()),
    path("refresh/", views.RefreshAPIView.as_view()),
    path("logout/", views.LogoutAPIView.as_view()),
    path("logout-all/", views.LogoutAllSessionsAPIView.as_view()),
    path("forgot/", views.ForgotAPIView.as_view()),
    path("reset/", views.ResetAPIView.as_view()),
]
