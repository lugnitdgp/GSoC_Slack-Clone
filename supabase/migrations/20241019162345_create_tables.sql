-- Enable uuid generation extension (if not enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: user_data
CREATE TABLE IF NOT EXISTS user_data (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    username text NOT NULL,
    avatar_url text,
    email text NOT NULL,
    phone text,
    hashed_password text -- Allow NULL to avoid trigger failure if not set initially
);

-- Disable RLS and Enable Realtime for user_data
ALTER TABLE user_data ENABLE REPLICA TRIGGER ALL;
ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;

-- Table: direct_messages
CREATE TABLE IF NOT EXISTS direct_messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    dm_chats jsonb NOT NULL
);

-- Disable RLS and Enable Realtime for direct_messages
ALTER TABLE direct_messages ENABLE REPLICA TRIGGER ALL;
ALTER TABLE direct_messages DISABLE ROW LEVEL SECURITY;

-- Table: chats_dm
CREATE TABLE IF NOT EXISTS chats_dm (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    messages jsonb NOT NULL
);

-- Disable RLS and Enable Realtime for chats_dm
ALTER TABLE chats_dm ENABLE REPLICA TRIGGER ALL;
ALTER TABLE chats_dm DISABLE ROW LEVEL SECURITY;

-- Table: channels_messages
CREATE TABLE IF NOT EXISTS channels_messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    messages jsonb NOT NULL,
    channel_name text NOT NULL,
    channel_members jsonb NOT NULL
);

-- Disable RLS and Enable Realtime for channels_messages
ALTER TABLE channels_messages ENABLE REPLICA TRIGGER ALL;
ALTER TABLE channels_messages DISABLE ROW LEVEL SECURITY;

-- Table: channels_list
CREATE TABLE IF NOT EXISTS channels_list (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    channels jsonb NOT NULL
);

-- Disable RLS and Enable Realtime for channels_list
ALTER TABLE channels_list ENABLE REPLICA TRIGGER ALL;
ALTER TABLE channels_list DISABLE ROW LEVEL SECURITY;

-- Table: todo_list
CREATE TABLE IF NOT EXISTS todo_list (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    todo_list jsonb NOT NULL
);

-- Disable RLS and Enable Realtime for todo_list
ALTER TABLE todo_list ENABLE REPLICA TRIGGER ALL;
ALTER TABLE todo_list DISABLE ROW LEVEL SECURITY;

-- Table: mails_sent
CREATE TABLE IF NOT EXISTS mails_sent (
    task_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_sent text NOT NULL,
    t_f boolean NOT NULL
);

-- Disable RLS and Enable Realtime for mails_sent
ALTER TABLE mails_sent ENABLE REPLICA TRIGGER ALL;
ALTER TABLE mails_sent DISABLE ROW LEVEL SECURITY;

-- Table: channels_todolist
CREATE TABLE IF NOT EXISTS channels_todolist (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    todo_list jsonb NOT NULL
);

-- Disable RLS and Enable Realtime for channels_todolist
ALTER TABLE channels_todolist ENABLE REPLICA TRIGGER ALL;
ALTER TABLE channels_todolist DISABLE ROW LEVEL SECURITY;

-- Trigger function for handling new user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_data (id, username, avatar_url, email, phone, hashed_password)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'default_password_hash' -- Placeholder value to avoid NULL issues
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user sign-up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function to update channel members in channels_list
CREATE OR REPLACE FUNCTION public.handle_channel_member_add()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE channels_list
  SET channels = jsonb_set(
    channels_list.channels,
    '{members}',
    coalesce(
      channels_list.channels->'members',
      '[]'::jsonb
    ) || to_jsonb(NEW)
  )
  WHERE id = NEW.channel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to invoke handle_channel_member_add() on new member insert
CREATE TRIGGER on_channel_member_added
AFTER INSERT ON channels_messages
FOR EACH ROW EXECUTE FUNCTION public.handle_channel_member_add();
