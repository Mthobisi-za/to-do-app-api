create table users(
    username text not null,
    password text not null,
    auth_token text primary key
);

create table tasks(
    auth text, foreign key (auth) references users (auth_token),
    task text not null
);