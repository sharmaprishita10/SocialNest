
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("following", views.following, name="following"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API routes
    path("posts" , views.post, name="post"),                                        #POST request
    path("posts/<str:type>", views.posts, name="posts"),                            #GET request
    path("follow/<str:username>", views.follow, name="follow"),                     #GET and PUT request
    path("edit-post", views.edit_post, name="edit-post"),                           #PUT request
    path("like-unlike/<int:post_id>", views.like_unlike, name="like-unlike")        #GET and PUT request
]
