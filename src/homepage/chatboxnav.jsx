import chatboxnavCSS from'./chatboxnav.module.css'

export default function Searchuser() {
    return(
        <>
            <div className={chatboxnavCSS.searchbar}>
                <div className={chatboxnavCSS.heading}>
                    <p>New Message</p>
                </div>
                <div className={chatboxnavCSS.enter}>
                    <label htmlFor="to">To:</label>
                    <div className={chatboxnavCSS.in}>
                    <input type="text" name='to' className={chatboxnavCSS.input} />
                    </div>
                </div>
            </div>
            <div className={chatboxnavCSS.chats}></div>
        </>
        
    )
}