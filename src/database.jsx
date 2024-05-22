import supabase from "./supabase.jsx";

export async function Getuserdetails(id){
    let { data: specific_user_data, error } = await supabase
    .from('user_data')
    .select('*') //selecting all coloumns
    .eq('id',id); //gets the row where the id matches
    if (error) {
        console.error('Error fetching user data:', error);
        return false;
      }
    return specific_user_data

}
export async function CheckemailExists(email) {
  let { data: user_data, error1 } = await supabase
    .from('user_data')
    .select('email') // Select only the 'email' column
    .eq('email', email);

  if (error1) {
    console.error('Error checking email:', error1);
    return false;
  }

  return user_data?.length > 0; // Return true if data exists
}



