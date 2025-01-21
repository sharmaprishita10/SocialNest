from django.contrib import admin

from .models import *


class UserAdmin(admin.ModelAdmin):
    list_display = ("id" , "username", "email")
    filter_horizontal = ("followers",)

class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "poster", "content", "date_time")
    filter_horizontal = ("likes",)




# Register your models here.

admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)