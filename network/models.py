from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", blank=True, symmetrical=False)

    def __str__(self):
        return f"{self.id}: {self.username}"

class Post(models.Model):
    poster = models.ForeignKey(User, on_delete = models.CASCADE, related_name="my_posts")
    content = models.TextField(blank=True)
    date_time = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, blank=True, related_name="liked_posts")

    def __str__(self):
        return f"Posted by {self.poster} at {self.date_time}"

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.poster.username,
            "content": self.content,
            "timestamp": self.date_time.strftime("%b %d %Y, %I:%M %p")
        }

