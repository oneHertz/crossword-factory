from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from django.db.models import Count

from crosswords.models import Grid
# Register your models here.


UserModel = get_user_model()
admin.site.unregister(UserModel)
admin.site.unregister(Group)


@admin.register(UserModel)
class MyUserAdmin(UserAdmin):
    list_display = (
        "username",
        "first_name",
        "last_name",
        "email",
        "date_joined",
        "grid_count",
    )
    show_facets = False

    def get_ordering(self, request):
        if request.resolver_match.url_name == "auth_user_changelist":
            return ("-date_joined",)
        return ("username",)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .prefetch_related("crosswords_grids")
            .annotate(
                grid_count=Count("crosswords_grids"),
            )
        )


    def grid_count(self, obj):
        return obj.grid_count

    grid_count.admin_order_field = "event_count"