

from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in
from django.db.models import Q
from django.shortcuts import get_object_or_404

from knox.models import AuthToken

from rest_framework import generics, parsers
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.exceptions import (
    ValidationError
)
from crosswords.models import Grid
from crosswords.serializers import (
    AuthTokenSerializer,
    GridSerializer,
    GridEditorSerializer,
    LatestGridListSerializer,
    UserMainSerializer,
    UserInfoSerializer,
)


class LoginView(generics.CreateAPIView):
    """
    Login View: mix of knox login view and drf obtain auth token view
    """
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser,
                      parsers.JSONParser,)
    serializer_class = AuthTokenSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        authToken, token = AuthToken.objects.create(user)
        user_logged_in.send(
            sender=user.__class__,
            request=request,
            user=user
        )
        return Response({
            'username': user.username,
            'token': token
        })


class GridCreate(generics.CreateAPIView):
    queryset = Grid.objects.all()
    serializer_class = GridSerializer
    permission_classes = (IsAuthenticated,)


class LatestGridsList(generics.ListAPIView):
    queryset = Grid.objects.all().select_related('author')[:24]
    serializer_class = LatestGridListSerializer


class UserDetail(generics.RetrieveAPIView):
    serializer_class = UserMainSerializer
    lookup_field = 'username'

    def get_queryset(self):
        username = self.kwargs['username']
        if username != self.request.user.username:
            return User.objects.none()
        return User.objects.filter(username=username)


class GridDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GridSerializer
    lookup_field = 'uid'
    queryset = Grid.objects.all().select_related('author')

    def get_serializer_class(self, *args, **kwargs):
        if self.request.user and self.request.user.id == self.get_object().author_id:
            return GridEditorSerializer
        return GridSerializer

    def get_queryset(self):
        if self.request.method not in SAFE_METHODS:
            if self.request.user.id == None:
                return super().get_queryset().none()
            return super().get_queryset().filter(author_id=self.request.user.id)
        q = Q(published=True)
        if self.request.user.id != None:
            q |= Q(author_id=self.request.user.id)
        return super().get_queryset().filter(q)


class UserEditView(generics.RetrieveUpdateAPIView):
    serializer_class = UserInfoSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def get_queryset(self):
        return User.objects.none()


@api_view(['POST'])
def check_grid_solution(request, uid):
    grid = get_object_or_404(Grid, uid=uid)
    submited_solution_hash = request.data.get('hash')
    if not submited_solution_hash:
        raise ValidationError('missing hash')
    return Response({'is_ok': grid.check_solution(submited_solution_hash)})
