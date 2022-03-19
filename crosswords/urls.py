from django.urls import path, re_path, include
from . import views

urlpatterns = [
    path('grid/new', views.GridCreate.as_view(), name='route_create'),
    path('latest-grids/', views.LatestGridsList.as_view(), name='latest_routes_list'),
    re_path(r'^user/(?P<username>[a-zA-Z0-9_-]+)/?$', views.UserDetail.as_view(), name='user_detail'),
    re_path(r'^grid/(?P<uid>[a-zA-Z0-9_-]+)/?$', views.GridDetail.as_view(), name='grid_detail'),
    re_path(r'^grid/(?P<uid>[a-zA-Z0-9_-]+)/check/?$', views.check_grid_solution, name='grid_check_view'),
    path('auth/user/', view=views.UserEditView.as_view(), name='auth_user_detail'),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/emails/', view=views.EmailsView.as_view(), name='auth_emails'),
    re_path(r'^auth/emails/(?P<email>[^/]+)/?$', views.EmailDetailView.as_view(), name="auth_email_detail"),
    path('auth/registration/resend-verification/', views.ResendVerificationView.as_view(), name="auth_resend_verification"),
    path('auth/login', view=views.LoginView.as_view(), name='knox_login'),
]