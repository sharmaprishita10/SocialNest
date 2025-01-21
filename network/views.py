from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
import json
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
from .models import *


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def post(request):

    # Publishing a post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get contents of the post
    data = json.loads(request.body)
    content = data.get("content", "")

    # Create a post
    post = Post(poster = request.user, content = content)
    post.save()

    return JsonResponse({"message": "Your post is published successfully."}, status=201)


def posts(request, type):
    # Filter posts returned based on the type
    if type == "all":
        posts = Post.objects.all()      # All posts
    elif type == "following":
        if request.user.is_authenticated:
            followed_users = User.objects.filter(followers = request.user)
            posts =  Post.objects.filter(poster__in = followed_users)       # Posts by following users
        else:
            return HttpResponseRedirect(reverse("login"))
    else:
        # Query for requested user
        try:
            user = User.objects.get(username=type)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found."}, status=404)
        
        posts = Post.objects.filter(poster=user)        # Posts by a specific user
        

    # Return posts in reverse chronologial order
    posts = posts.order_by("-date_time").all()
    paginator = Paginator(posts, 10)        # Show 10 posts per page
    page_number = int(request.GET.get('page'))
    page_obj = paginator.get_page(page_number)

    return JsonResponse([paginator.num_pages] + [post.serialize() for post in page_obj], safe=False)

@csrf_exempt
@login_required
def follow(request, username):
    # Query for requested user
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    # GET follower and following count
    if request.method == "GET":
        return JsonResponse({
            "follower_count" : user.followers.count(),
            "following_count" : User.objects.filter(followers=user).count()
        })
    # Follow/Unfollow request
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("action") == "Follow":
            user.followers.add(request.user)
        elif data.get("action") == "Unfollow":
            user.followers.remove(request.user)
        return HttpResponse(status=204)
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

@csrf_exempt
@login_required
def edit_post(request):

    # PUT request required for editing the post
    if request.method == "PUT":
        data = json.loads(request.body)
        post_id = data.get("post_id")
        content = data.get("content")

        # Get the post
        post = Post.objects.get(pk=post_id)

        # Edit the post by updating its content
        post.content = content
        post.save()
        return HttpResponse(status=204)
    else:
        return JsonResponse({
            "error": "PUT request required."
        }, status=400)

@csrf_exempt
@login_required
def like_unlike(request, post_id):

    # Get the post
    post = Post.objects.get(pk=post_id)

    # GET the title of like/unlike button 
    if request.method == "GET":
        liker_row = Post.objects.filter(pk=post_id, likes=request.user).first()
        if liker_row is None:
            like_action = "Like"
        else:
            like_action = "Unlike"
        return JsonResponse({
            "like_title" : like_action,
            "likes" : post.likes.all().count()
        })

    # PUT request required to like/unlike a post
    elif request.method == "PUT":
        data = json.loads(request.body)
        action = data.get("action")
        
        # Like/Unlike the post
        if action == "Like":
            post.likes.add(request.user)
            
        elif action == "Unlike":
            post.likes.remove(request.user) 

        return JsonResponse({
            "likes" : post.likes.all().count()
        }) 
        
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)

@login_required
def following(request):
    return render(request, "network/following.html")

@login_required
def profile(request, username):
    # Query for requested user
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return HttpResponse(status=404)
    
    follower_row = User.objects.filter(username=username, followers=request.user).first()
    if follower_row is None:
        action = "Follow"
    else:
        action = "Unfollow"
        
    return render(request, "network/profile.html", {
        "profile_user" : user,
        "posts" : Post.objects.filter(poster=user),
        "action" : action
    })