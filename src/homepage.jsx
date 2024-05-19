import supabase from './supabase'
import './App.css'

function Home(data) {
  
  console.log('data:', data);

 console.log(data.data.user.id)

  return (
    <>
      <h1>heloooo</h1>
    </>
  )
}

export default Home
