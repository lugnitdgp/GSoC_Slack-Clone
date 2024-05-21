import supabase from "./supabase.jsx";

async function CheckemailExists(email) {
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

export default CheckemailExists;
