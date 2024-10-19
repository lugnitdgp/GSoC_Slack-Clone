-- Table: user_data
CREATE TABLE IF NOT EXISTS user_data (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    username text NOT NULL,
    avatar_url text,
    email text NOT NULL,
    phone text,
    hashed_password text NOT NULL
);

-- Table: direct_messages
CREATE TABLE IF NOT EXISTS direct_messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    dm_chats jsonb NOT NULL
);

-- Table: chats_dm
CREATE TABLE IF NOT EXISTS chats_dm (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    messages jsonb NOT NULL
);

-- Table: channels_messages
CREATE TABLE IF NOT EXISTS channels_messages (
    channel_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    messages jsonb NOT NULL,
    channel_name text NOT NULL,
    channel_members jsonb NOT NULL
);

-- Table: channels_list
CREATE TABLE IF NOT EXISTS channels_list (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    channels jsonb NOT NULL
);

-- Table: todo_list
CREATE TABLE IF NOT EXISTS todo_list (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    todo_list jsonb NOT NULL
);

-- Table: mails_sent
CREATE TABLE IF NOT EXISTS mails_sent (
    task_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_sent text NOT NULL,
    t_f boolean NOT NULL
);

-- Table: channels_todolist
CREATE TABLE IF NOT EXISTS channels_todolist (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    todo_list jsonb NOT NULL
);
