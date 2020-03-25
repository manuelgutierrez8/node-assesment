# Posts API assesment

This API will allow you to 
- Signup Users
- Login 
- Create post
- Get posts per user
- Get specific post
- Update post
- Delete post

## How to run the API?

set with your preferred console on the project folder and run the following commands:

```npm install```

```npm run start```

visit [http://localhost:3000](http://localhost:3000)

## API routes 

On a API client like **postman** add the following configurations in order to access the routes

### Signup User

request url : http://localhost:3000/api/signup

method: GET

body : 
```
{
    "name": "Your Name",
    "email": "email@test.com",
    "password": "password"
}
```

### Login User

request url : http://localhost:3000/api/login

method: POST

body : 
```
{
    "email": "email@test.com",
    "password": "password"
}
```

This will return the required token to access the posts methods (create, get posts, get post by id, update and delete)

```
{
    "message": "Success",
    "token": "[tokenstring]"
}
```

### Create Post 

In order to create a post, you need to copy the access token provided in the login response and added as an authentication header as Bearer [Token]. After that you can follow the next steps

request url : http://localhost:3000/api/post

method: POST

body : 
```
{
	"title":"Post title",
	"imageUrl": "url",
	"content": "This is the content"
}
```

### Get Posts

In order to get user's posts, you need to copy the access token provided in the login response and added as an authentication header as Bearer [Token]. After that you can follow the next steps

request url : http://localhost:3000/api/posts

method: GET

### Get Posts by Id

In order to get post by Id, you need to copy the access token provided in the login response and added as an authentication header as Bearer [Token]. After that you can follow the next steps

request url : http://localhost:3000/api/posts/:id

method: GET

*note: :id is the '_id' column on the mongo collection*

### Update Post 

In order to update a post, you need to copy the access token provided in the login response and added as an authentication header as Bearer [Token]. After that you can follow the next steps

request url : http://localhost:3000/api/posts/:id

method: PUT

body : 
```
{
	"title":"new Title",
	"imageUrl": "url",
	"content": "This is the content changed"
}
```

*note: :id parameter on url is the '_id' column on the mongo collection*

*you can send a column in the json, the method will update just the columns writed on the json*


### Delete Post 

In order to delete a post, you need to copy the access token provided in the login response and added as an authentication header as Bearer [Token]. After that you can follow the next steps

request url : http://localhost:3000/api/post/:id

method: DELETE

*note: :id parameter on url is the '_id' column on the mongo collection*

