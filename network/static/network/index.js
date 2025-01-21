document.addEventListener('DOMContentLoaded', () => {
    
    // To load all posts by all the users
    view_posts('all', 'all_posts_div', 1); 
    // To load all posts by following users
    view_posts('following', 'following_posts_div', 1);

    // To ensure that no empty post is published
    const post_btn = document.querySelector('#submit-post');
    post_btn.disabled = true;
    const content_ta = document.querySelector('#content');

    content_ta.onkeyup = () => {
        if(content_ta.value.length > 0)
        {
            post_btn.disabled = false;
        }
        else
        {
            post_btn.disabled = true;
        }
    };

    // For creating a new post
    document.querySelector('#new-post').onsubmit = () => {
        
        const content = content_ta.value ;
        // Send a POST request to create a new post
        fetch('/posts', {
            method: 'POST',
            body: JSON.stringify({
                content : content
            })
        })
        .then(response => {    
            // To reload all posts by all the users
            view_posts('all', 'all_posts_div', 1); 
            return response.json();
        })
        .then(result => {
            console.log(result);
            document.querySelector('.toast-body').innerHTML = result.message ;
            const toast_div = document.querySelector('.toast');
            var toast = new bootstrap.Toast(toast_div);

            toast.show();
        })
        .catch(error => {
            console.log('Error', error);
        });

        post_btn.disabled = true;       // Disable the post button
        content_ta.value = '';          // Clear out the textarea

        // To stop the form from submitting to the server
        return false;
    };

});

function view_posts(type, div_name, page_no) {
    
    // For fetching all posts
    fetch(`/posts/${type}?page=${page_no}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts);

        // To clear out the posts_div before creating divs for posts
        document.querySelector(`#${div_name}`).innerHTML = '';      
        // Create a div for each post starting from index 1
        posts.slice(1).forEach(post => {
            const post_div = document.createElement('div');
            post_div.className = 'row p-3 my-2 border shadow-sm';
            
            // Create a div for post's content
            const content_div = document.createElement('div');      
            content_div.innerHTML = `<div class="my-2">${post.content}</div>`;

            // username of the current user
            const current_user = document.querySelector(`#${div_name}`).dataset.user; 
            
            // Edit button only for current user's posts
            if(post.poster === current_user) {
                const edit_btn = document.createElement('button');
                edit_btn.innerHTML = '<i class="bi bi-pencil" style="color: white;"></i> Edit Post';
                edit_btn.className = 'edit-btn btn btn-dark';
                edit_btn.dataset.id = post.id;

                // Append the button to the content div
                content_div.append(edit_btn);
            
            }
            post_div.innerHTML = `<div class="col-6"><a class="link-dark fw-bold text-decoration-none" href="/profile/${post.poster}">${post.poster}</a></div><div class="col-6 d-flex justify-content-end text-secondary">${post.timestamp}</div>` ;
            post_div.append(content_div);

            // Like button and GET the number of likes
            fetch(`/like-unlike/${post.id}`)
            .then(response => response.json())
            .then(data => {
                
                let icon = '';
                if(data.like_title === 'Like') {
                    icon = 'bi bi-hand-thumbs-up';
                }
                else {
                    icon = 'bi bi-hand-thumbs-up-fill';
                }
                post_div.innerHTML += `<div class="d-flex justify-content-start"><div>${data.likes}</div> <i class="like-btn ms-1 ${icon}" style="color: cornflowerblue;" data-id="${post.id}">${data.like_title}</i></div>`;
            })
            .catch(error => {
                console.log('Error', error);                 
            });

            document.querySelector(`#${div_name}`).append(post_div);
        });

        // Create pagination front-end
        const page_nav = document.querySelector('#page_nav');
        page_nav.innerHTML = '';

        const previous = document.createElement('li');
        previous.innerHTML = `<a class="page-link" data-page="${page_no-1}" href=""><span>&laquo;</span></a>`;
        previous.className = 'page-item';
        page_nav.append(previous);
        
        // If on first page, disable previous
        if(page_no === 1) {      
            previous.classList.add('disabled');
        }

        // Create li elements for each page
        for(let i = 0 ; i < posts[0] ; i++) {
            let li = document.createElement('li') ;
            
            // For current page
            if((i+1) === page_no) {
                li.className = 'page-item active';
            }
            // For other pages
            else {
                li.className = 'page-item';
            }
            li.innerHTML = `<a class="page-link" data-page="${i+1}" href="">${i+1}</a>`;
            page_nav.append(li);
        }
        const next = document.createElement('li');
        next.innerHTML = `<a class="page-link" data-page="${page_no+1}" href=""><span>&raquo;</span></a>`;
        next.className = 'page-item';
        page_nav.append(next);
        
        // If on last page, disable next
        if(page_no === posts[0]) {      
            next.classList.add('disabled');
        }
        
    })
    .catch(error => {
        console.log('Error', error);
    });
}

document.addEventListener('click', (event) => {
    const element = event.target;

    // If edit button is clicked
    if(element.className.includes('edit-btn')) {
        const content_div = element.parentElement;
        // Take the content of the post
        const content = content_div.firstElementChild.innerHTML;
        // Take the post id
        const post_id = element.dataset.id;

        // Convert the content div to a form with a textarea
        div_to_ta(content_div, content, post_id); 

    }
    // If like button is clicked
    else if(element.className.includes('like-btn')) {

        // Take the post id
        const post_id = element.dataset.id;

        // Like or unlike the post depending on the action 
        fetch(`/like-unlike/${post_id}` , {
            method : 'PUT',
            body : JSON.stringify({
                action: element.innerHTML
            })
        })
        .then(response => response.json())
        .then(data => {
            // Change the title of the button once clicked
            if(element.innerHTML === 'Like') {
                element.innerHTML = 'Unlike';
                element.classList.remove('bi-hand-thumbs-up');
                element.classList.add('bi-hand-thumbs-up-fill');
            } 
            else {
                element.innerHTML = 'Like';
                element.classList.remove('bi-hand-thumbs-up-fill');
                element.classList.add('bi-hand-thumbs-up');
            }
            // To update the number of likes asynchronously
            const like_div = element.parentElement;
            like_div.firstElementChild.innerHTML = `${data.likes}`;
        })
        .catch(error => {
            console.log('Error', error);
        });
    }
    // If page-link is clicked
    else if(element.className === 'page-link') {
        const page_no = parseInt(element.dataset.page);
        view_posts('all','all_posts_div', page_no);
        // To prevent the anchor tag from going to the href 
        event.preventDefault();
    }
});

// Function that converts content div to a textarea
function div_to_ta(content_div, old_content, post_id) {
    // Create the div
    const textarea_div = document.createElement('div');

    // Create the form
    const edit_form = document.createElement('form');
    edit_form.className = 'my-2 d-flex justify-content-between align-items-center';
    const textarea = document.createElement('textarea');
    // Pre-fill the textarea with current content
    textarea.innerHTML = `${old_content}`;
    textarea.className = 'w-75 p-2 border rounded';

    const save_btn = document.createElement('button');
    save_btn.innerHTML = 'Save';
    save_btn.className = 'btn btn-primary';

    edit_form.append(textarea, save_btn);
    textarea_div.append(edit_form);

    // Replace the content div with the form div
    content_div.replaceWith(textarea_div);

    // To ensure no empty post is published
    textarea.onkeyup = () => {
        if(textarea.value.length > 0)
        {
            save_btn.disabled = false;
        }
        else
        {
            save_btn.disabled = true;
        }
    };

    edit_form.onsubmit = () => {
        const new_content = textarea.value;

        // Save the new contents
        fetch('/edit-post' , {
            method : 'PUT',
            body : JSON.stringify({
                post_id : post_id,
                content : new_content
            })
        })
        .then(() => {
            // Convert the form div back to the content div
            ta_to_div(textarea_div, new_content, post_id);
        })
        .catch(error => {
            console.log('Error', error);
        });

        return false;
    };
    
}

// Function that converts textarea to a content div
function ta_to_div(textarea_div, new_content, post_id) {
    // Create the content div
    const content_div = document.createElement('div');      
    content_div.innerHTML = `<div class="my-2">${new_content}</div>`;
    const edit_btn = document.createElement('button');
    edit_btn.className = 'btn btn-dark';
    edit_btn.innerHTML = '<i class="bi bi-pencil" style="color: white;"></i> Edit Post';
    content_div.append(edit_btn);

    // Replace the form div with the content div
    textarea_div.replaceWith(content_div);

    // Set the onclick event listener
    edit_btn.onclick = () => {
        // Convert the content div to the form div
        div_to_ta(content_div, new_content, post_id); 
    };
}