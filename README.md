Slack Clone
Tech Stacks Used: Vite React
                  Node js
                  Supabase
Dockers configuration is also done.
Working:
In this the user can login using the OAuth for both google and the Github & by the email also.
Later if the user forgets the mail they reset their password through the registered mail.
Once logged in the user gets into the homepage where there are multiple options like:
1) The User can make his own Todo list,view and delete it also.
2) The User can authenticate to a gmail to get his account linked with google calendar to view,edit and delete the events in primary google calendar that is linked.
3) The User can initiate a conversion with any user of this Slack Clone and they can share text and images(size<=50M.B)
4) The User can create a channel and invite,add admins,delete admins,assign& delete tasks to everyone in the channel,assign task to a individual in the channel,direct message with a member of the channel,add new members into the channel,and delete the channel also.Where the features are available according to the role such as if they are the Admin or a member.
5) There is also a search bar available at the top to search for any channel that the User belongs to or any user of the Slack Clone with whom he has initiated a conversation.
6) The Slack Clone is Responsive also.
Set-Up:
Firstly create a slack account and make a new project and store the project URL & Key in a .env file named as VITE_SUPABASE_URL &VITE_SUPABASE_KEY respectively and even VITE_Backend_Port to specify where your backend be listening from.
In that slack project create a bucket named photos
Enable the Google & Github authentication also in the providers of supabse for authentication.
Create 8 Tables named like this:
1) user_data:To store user data 
coloumns:id(uuid),updated_at(timestamp),username(text),avatar_url(text),email(text),phone(text),hashed_password(text) and link this with the changes in the auth like we get the username,phone,hashed_password in user_meta_data uding SQL editor or any.
2) direct_messages:To store the contacts info of a user related to direct messaging
coloumns:id(uuid),created_at(timestamp),dm_chats(json or jsonb) 
3) chats_dm:To store the direct messages
coloumns:id(uuid),created_at(timestamp),messages(json or jsonb)
4) channels_messages:To store channel data and messages
coloumns:channel_id(uuid),created_at(timestamp),messages(json or jsonb),channel_name(text),channel_members(json or jsonb)
5) channels_list:To store the channels a user is a memeber of
coloumns:id(uuid),created_at(timestamp),channels(json or jsonb)
6) Todo_list:To store the todo list of a user
coloumns:id(uuid),created_at(timestamp),todo_list(json or jsonb)
7) Mails_sent:To keep track of mails sent as reminders of tasks.
coloumns:task_id(uuid),created_at(timestamp),last_sent(text),t_f(bool)
8) Channels_todolist:To store the tasks assigned for everyone in the channel
coloumns:id(uuid),created_at(timestamp),todo_list(json or jsonb)
