import re
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.utils.safestring import mark_safe

from allauth.account.models import EmailAddress
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from crosswords.models import Grid
from utils.validators import custom_username_validators


class UserInfoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=custom_username_validators)
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name')


class AuthTokenSerializer(serializers.Serializer):
    username = serializers.CharField(
        label=_("Username"),
        write_only=True
    )
    password = serializers.CharField(
        label=_("Password"),
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )
    token = serializers.CharField(
        label=_("Token"),
        read_only=True
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)

            # The authenticate call simply returns None for is_active=False
            # users. (Assuming the default ModelBackend authentication
            # backend.)
            if not user:
                msg = _('Unable to log in with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
            
            # if not EmailAddress.objects.filter(user=user, verified=True).exists():
            #    raise serializers.ValidationError(
            #        mark_safe(_('Please verify your email address or <a href="/verify-email">resend verification</a>')),
            #        code='authorization'
            #    )
        else:
            msg = _('Must include "username" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs


class RelativeURLField(serializers.ReadOnlyField):
    """
    Field that returns a link to the relative url.
    """
    def to_representation(self, value):
        request = self.context.get('request')
        url = request and request.build_absolute_uri(value) or ''
        return url


class UserInfoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(validators=custom_username_validators)
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name')


class GridSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='uid')
    author = UserInfoSerializer(read_only=True)
    solution = serializers.CharField(write_only=True)
    creation_date = serializers.ReadOnlyField()
    modification_date = serializers.ReadOnlyField()

    def validate(self, data):
        width = data.get('width')
        height = data.get('height')
        solution = data.get('solution', '')
        published = data.get('published')

        if len(solution) != width * height:
            raise ValidationError('Solutions not complete %s'% solution)
        if not published and re.match(r'[^a-z#_-]', solution):
            raise ValidationError('Invalid characters')
        if published and re.match(r'[^a-z#-]', solution):
            raise ValidationError('Invalid characters')
        data['solution'] = solution.replace('#', ' ')
        return data

    def create(self, validated_data):
        if '_' in validated_data.get('solution'):
            validated_data['published'] = False
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
        grid = Grid(
            author=user,
            **validated_data
        )
        grid.save()
        return grid

    def update(self, instance, validated_data):
        if '_' in validated_data.get('solution'):
            validated_data['published'] = False
        return super().update(instance, validated_data)

    class Meta:
        model = Grid
        fields = ('id', 'author', 'title', 'creation_date', 'modification_date', 'width', 'height', 'title', 'solution', 'definitions', 'grid', 'published')


class GridEditorSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='uid')
    author = UserInfoSerializer(read_only=True)
    creation_date = serializers.ReadOnlyField()
    modification_date = serializers.ReadOnlyField()

    def validate(self, data):
        width = data.get('width')
        height = data.get('height')
        solution = data.get('solution', '')
        published = data.get('published')
        if len(solution) != width * height:
            raise ValidationError('Solutions not complete')
        if not published and re.match(r'[^a-z#_-]', solution):
            raise ValidationError('Invalid characters')
        if published and re.match(r'[^a-z#-]', solution):
            raise ValidationError('Invalid characters')
        data['solution'] = solution.replace('#', ' ')
        return data

    def create(self, validated_data):
        user = None
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            user = request.user
        grid = Grid(
            author=user,
            **validated_data
        )
        grid.save()
        return grid

    class Meta:
        model = Grid
        fields = ('id', 'author', 'title', 'creation_date', 'modification_date', 'width', 'height', 'title', 'solution', 'definitions', 'grid', 'published')


class UserGridListSerializer(serializers.ModelSerializer):
    url = RelativeURLField(source='api_url')
    id = serializers.ReadOnlyField(source='uid')
    title = serializers.ReadOnlyField()
    creation_date = serializers.ReadOnlyField()
    modification_date = serializers.ReadOnlyField()

    class Meta:
        model = Grid
        fields = ('id', 'url', 'title', 'creation_date', 'modification_date', 'width', 'height', 'published')

class LatestGridListSerializer(serializers.ModelSerializer):
    url = RelativeURLField(source='api_url')
    id = serializers.ReadOnlyField(source='uid')
    author = UserInfoSerializer(read_only=True)
    
    class Meta:
        model = Grid
        fields = ('id', 'url', 'author', 'title')


class UserMainSerializer(serializers.ModelSerializer):
    #latest_routes = serializers.SerializerMethodField()
    crosswords_grids = UserGridListSerializer(many=True)
    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'crosswords_grids')
    
    #def get_latest_routes(self, obj):
    #    return UserRouteListSerializer(instance=obj.routes.all()[:5], many=True, context=self.context).data


class EmailSerializer(serializers.ModelSerializer):
    class Meta(object):
        fields = ('email', 'primary', 'verified')
        model = EmailAddress
        read_only_fields = ('verified',)

    def create(self, validated_data):
        email = super(EmailSerializer, self).create(validated_data)
        email.send_confirmation()
        user = validated_data.get('user')
        query = EmailAddress.objects.filter(
            primary=True, user=user
        )
        if not query.exists():
            email.set_as_primary()
        return email

    def update(self, instance, validated_data):
        primary = validated_data.pop('primary', False)
        instance = super(EmailSerializer, self).update(
            instance, validated_data
        )
        if primary:
            instance.set_as_primary()
        return instance

    def validate_email(self, email):
        user, domain = email.rsplit("@", 1)
        email = "@".join([user, domain.lower()])

        if self.instance and email and self.instance.email != email:
            raise serializers.ValidationError(
                _(
                    "Existing emails may not be edited. Create a new one "
                    "instead."
                )
            )

        return email

    def validate_primary(self, primary):
        # TODO: Setting 'is_primary' to 'False' should probably not be
        #       allowed.
        if primary and not (self.instance and self.instance.verified):
            raise serializers.ValidationError(
                _(
                    "Unverified email addresses may not be used as the "
                    "primary address."
                )
            )
        return primary

class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    def save(self):
        try:
            email = EmailAddress.objects.get(
                email__iexact=self.validated_data['email'],
                verified=False
            )
            email.send_confirmation()
        except EmailAddress.DoesNotExist:
            # email does not exists in db, just ignore
            pass
