

from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_in
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from knox.models import AuthToken
from io import BytesIO
from rest_framework import generics, parsers, status
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
    EmailSerializer,
    ResendVerificationSerializer
)
from PIL import Image, ImageDraw, ImageFont


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
    if grid.check_solution(submited_solution_hash):
        return Response({'is_ok': True, 'solution': grid.solution, 'width': grid.width, 'height': grid.height})
    return Response({'is_ok': False})




class EmailsView(generics.ListCreateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailSerializer

    def get_queryset(self):
        return self.request.user.emailaddress_set.all().order_by('-primary', '-verified', 'email')

    def perform_create(self, serializer):
        return serializer.save(user=self.request.user)

class EmailDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = EmailSerializer
    lookup_field = 'email'

    def get_queryset(self):
        return self.request.user.emailaddress_set.all()

class ResendVerificationView(generics.GenericAPIView):
    serializer_class = ResendVerificationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def preview_pic(request, uid):
    grid = get_object_or_404(Grid, uid=uid)

    img = Image.new("RGBA", (800, 600), (0,0,0,0))
    draw = ImageDraw.Draw(img, "RGBA")

    r = 8 / 6
    gr = grid.width / grid.height
    if gr > r:
        fw = 800 - 20
        fh = fw / gr
        offset_x = 10
        offset_y = (600 - fh) / 2
    else:
        fh = 600 - 20
        fw = fh * gr
        offset_x = (800 - fw) / 2
        offset_y = 10

    draw.rectangle(((offset_x, offset_y), (offset_x + fw, offset_y + fh)), outline="black", width=2)
    pattern = grid.grid
    for x in range(grid.width):
        draw.rectangle(((offset_x, offset_y), (offset_x + fw / grid.width * x, offset_y + fh)), outline="black", width=2)
    for y in range(grid.height):
        draw.rectangle(((offset_x, offset_y), (offset_x + fw, offset_y + fh / grid.height * y)), outline="black", width=2)
    
    for i, c in enumerate(grid.grid):
        x = i % grid.width
        y = i // grid.width
        if c == " ":
            draw.rectangle(
                (
                    (offset_x + fw / grid.width * x, offset_y + fh / grid.height * y),
                    (offset_x + fw / grid.width * (x + 1), offset_y + fh / grid.height * (y + 1))
                ),
                fill="black"
            )
        elif request.user == grid.author:
            font = ImageFont.truetype('times new roman.ttf', size=fw / grid.width * 0.8)  # size should be in points but I don't now, how to do it
            draw.text((offset_x * 1.05 + fw / grid.width * x, offset_y * 1.05 + fh / grid.height * y), grid.solution[i], fill='black', font=font)
    with BytesIO() as output:
        img.save(output, format="PNG")
        return HttpResponse(output.getvalue(), content_type="image/png")