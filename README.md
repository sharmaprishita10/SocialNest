# Network

Network is a social media web application that allows users to create posts, follow other users, like posts, and view posts from followed users.

### Description

This project is a social networking platform where users can register, create posts, follow/unfollow other users, and like/unlike posts. The application is built using Django for the backend and JavaScript for dynamic front-end interactions. The RESTful API allows for seamless data retrieval and updates, ensuring a smooth user experience.

### Getting Started

1. Run the following commands:
```bash
python manage.py makemigrations network
python manage.py migrate
python manage.py runserver
```
2. Visit http://127.0.0.1:8000/ in your web browser to use the social network site.

### Specification

#### New Post
- Logged-in users can create text-based posts.
- Posts appear in the "All Posts" section and the user’s profile.

#### All Posts
- The "All Posts" page displays posts from all users.
- Posts are shown in reverse chronological order (newest first).
- Each post displays the username, post content, timestamp, and the number of likes.

#### Profile Page
- Clicking on a username directs users to their profile page.
- Profile pages display:
  - The number of followers and the number of users they follow.
  - All posts by that user.
  - A "Follow" or "Unfollow" button.

#### Following
- The "Following" page shows posts only from users that the current user follows.
- Behaves similarly to the "All Posts" page but with a filtered set of posts.
- Only available to logged-in users.

#### Pagination
- A maximum of 10 posts are displayed per page.
- If more than 10 posts exist, "Next" and "Previous" buttons appear for navigation.

#### Edit Post
- Users can edit their own posts.
- Users can save their changes without a full page reload using JavaScript.

#### Like and Unlike
- Users can like or unlike posts using a button.
- The like count updates dynamically without reloading the page.

#### RESTful API Integration
- The project utilizes RESTful API to fetch, create, update, and manage posts and interactions.

### CSS and Design

The design is clean and responsive, ensuring a user-friendly experience.

### About

This project was developed to demonstrate proficiency in full-stack web development using Django, JavaScript, and RESTful API interactions.

### Video Demo

You can view a video showcasing the project on [YouTube](https://www.youtube.com/watch?v=gkzWngTf0iw).
