import { useState, useEffect, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';

//const socket = io.connect("http://localhost:3001");


function App() {

  
  const [roomChat,setRoomChat] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [msg, setMsg] = useState("");
  const [masList, setMasList] = useState([]);
  const [groupMasList, setGroupMasList] = useState([]);
  const [allGroupList,setAllGroupList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [tergetUser, setTergetUser] = useState("");
  const [tergetGroup, setTergetGroup] = useState("");
  const socketRef = useRef(null);
  const [roomName,setRoomName] = useState("");
  // const [joinRoomName,setJoinRoomName] = useState("");

  const ulList = useRef(null);

  const wrapperChatBox = {
    width: "100vw",
    height: "100vh",
    backgroundColor: "yellow",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  };

  const messageSentBox = {
    width: "100%",
    height: "20%",
    backgroundColor: "red",
    position: "absolute",
    bottom: "0",
    left: "0",
  };

  const messageBox = {
    width: "90%",
    height: "80%",
    backgroundColor: "green",
    display: "flex",
    justifyContent: "space-between",
  };

  const messageListStyle = {
    backgroundColor: "lightblue",
    width: "70%",
    padding: "10px"
  };

  const activeListStyle = {
    backgroundColor: "violet",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    width: "30%"
  };
   // `isOn` is the state variable, initialized to `false`.
  // `setIsOn` is the function we use to update `isOn`.
  const [isOn, setIsOn] = useState(false);

  // This function toggles the state from `true` to `false` and vice versa.
  const handleToggle = () => {
    setIsOn(!isOn);
    setRoomChat(!roomChat)
  };

  const masgOnChangeFun = (e) => {
    setMsg(e.target.value);
  }

const sendMsg = () => {

  if (msg.trim() !== "") {
    if (tergetUser.trim() !== "") {
      socketRef.current.emit("send_massage", { msg, user: tergetUser, userName });
    } else {
      if(roomChat){
        socketRef.current.emit("send_group_massage", { msg, tergetGroup ,userName});
      }else{
        socketRef.current.emit("send_massage", { msg, userName });
      }
    }
    setMsg("");
  } else {
    alert("Write a message");
  }
}

const creatRoomFun = ()=>{
  socketRef.current.emit("creatRoom", roomName);
}
// const joinRoomFun = ()=>{
//   socketRef.current.emit("joinRoom", roomName);
// }


  function creatChatList(text, index) {
    return <li key={index}> {text.userName } : {text.msg}</li>;
  }
  function creatRoomChatList(text, index) {
    
    return <li key={index}>{text.userName} : {text.msg}</li>;
  }

  function creatOptionList(user,nameType, index) {
    return (
      <label key={index}>
        <input
          type="radio"
          name={nameType}
          value={user.userId}
          onChange={(e) => setTergetUser(e.target.value)}
        />
        {user.userName}
      </label>
    );
  }
  function creatOptionListFGroup(user,nameType, index) {
    return (
      <label key={index}>
        <input
          type="radio"
          name={nameType}
          value={user.joinRoomName}
          onChange={(e) => setTergetGroup(e.target.value)}
        />
        {user.joinRoomName}
      </label>
    );
  }

  useEffect(() => {

    const id = window.prompt("Enter your user ID:");
    const name = window.prompt("What is your name:");

    setUserId(id || "anonymousId");
    setUserName(name || "Anonymous");
    console.log(import.meta.env.VITE_BASEURL);
    const socket = io.connect(`${import.meta.env.VITE_BASEURL}`, {
      query: { userId: id || "anonymousId" }
    });

    socketRef.current = socket;

    socket.on("server_massage", (massage) => {
      setMasList(prev => [...prev, massage]);
    });

    socket.on("server_group_massage", (massage) => {
      console.log(massage);
      setGroupMasList(prev => [...prev, massage]);
    });

    socket.on("new_user_connected", (userData) => {
      setAllUsers(userData);
    });
    
    socket.on("user_offLine", (userData) => {
      setAllUsers(userData);
    });

    socket.on("new_group_connected", (userData) => {
      setAllGroupList(prev => [...prev, userData]);
    });

    socket.emit("user_connected", {
      userId: id || "anonymousId",
      userName: name || "Anonymous"
    });

    return () => {
      socket.disconnect();
    };
  }, [socketRef]);

  useEffect(() => {
  
    // const nm = prompt("What is your name:");
    // if (nm && nm.trim() !== "") {
    //   setUserName(nm.trim());
    // } else {
    //   setUserName("Anonymous");
    // }
  }, []);

  useEffect(() => {
    // if (userName) {
    //   const userData = { userId: Date.now().toString(), userName };
    //   socket.emit("user_connected", userData);
    // }
  }, [userName]);

  return (
    <div style={wrapperChatBox}>
      <div style={messageSentBox}>
        <input type="text" value={msg} onChange={masgOnChangeFun} />
        <button onClick={sendMsg}>Send</button>
      </div>

      <div style={messageBox}>
      {roomChat ? <>
        <div style={messageListStyle}>
        <h4>room chat</h4>
          <ul >
            {groupMasList.map((mas, index) => creatRoomChatList(mas, index))}
          </ul>
        </div>

      </> : 
      <>
        <div style={messageListStyle}>
          <h4>privet chat</h4>
            <ul ref={ulList}>
              {masList.map((mas, index) => creatChatList(mas, index))}
            </ul>
        </div>
        
      </> }
      
        

        <div style={activeListStyle}>
          <div>
          <button onClick={handleToggle}>
            {/* The button's text changes based on the `isOn` state */}
            {isOn ? 'Turn On' : 'Turn  Off'}
          </button>

          {/* This text is only rendered if `isOn` is true */}
          {/* {isOn && <p>The button is currently ON!</p>} */}
        </div>
          <input type="text" value={roomName} onChange={e =>{ setRoomName(e.target.value)}} />
          <button onClick={creatRoomFun}>Creat Room</button>
          <h4>Active Users:</h4>
          <label>
          <input
              type="radio"
              name='activeUserList'
              value=""
              onChange={(e) => setTergetUser(e.target.value)}
            />
            All user
          </label>
          {allUsers.map((user, index) => creatOptionList(user,"activeUserList", index))}
          <h4>All Group List</h4>
           <label>
          <input
              type="radio"
              name='activeGroupList'
              value=""
              onChange={(e) => setTergetUser(e.target.value)}
            />
            no group
          </label>
          {allGroupList.map((user, index) => creatOptionListFGroup(user,"activeGroupList", index))}
        </div>
      </div>
    </div>
  );
}

export default App;
