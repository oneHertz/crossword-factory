from django.urls import path, re_path
from . import views

urlpatterns = [
    path('grid/new', views.GridCreate.as_view(), name='route_create'),
    path('latest-grids/', views.LatestGridsList.as_view(), name='latest_routes_list'),
    re_path(r'^user/(?P<username>[a-zA-Z0-9_-]+)/?$', views.UserDetail.as_view(), name='user_detail'),
    re_path(r'^grid/(?P<uid>[a-zA-Z0-9_-]+)/?$', views.GridDetail.as_view(), name='route_detail'),
    path('auth/login', view=views.LoginView.as_view(), name='knox_login'),
    path('auth/user/', view=views.UserEditView.as_view(), name='auth_user_detail'),
]