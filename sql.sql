create table users(
    id serial primary key,
    username text not null,
    password text not null,
    auth_token text not null
);