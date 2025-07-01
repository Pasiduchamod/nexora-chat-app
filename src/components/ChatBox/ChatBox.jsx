import React, { useContext, useEffect, useState } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';

const ChatBox = () => {
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible
  } = useContext(AppContext);

  const [input, setInput] = useState('');

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );

            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
              userChatData.chatsData[chatIndex].updatedAt = Date.now();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatRef, {
                chatsData: userChatData.chatsData,
              });
            }
          }
        });

        setInput('');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );

            if (chatIndex !== -1) {
              userChatData.chatsData[chatIndex].lastMessage = 'Image';
              userChatData.chatsData[chatIndex].updatedAt = Date.now();
              if (userChatData.chatsData[chatIndex].rId === userData.id) {
                userChatData.chatsData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatRef, {
                chatsData: userChatData.chatsData,
              });
            }
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
    let date = timestamp.toDate();
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  };

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data()?.messages?.reverse() || []);
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  return chatUser ? (
    <div className={`chat-box ${chatVisible?"":"hidden"}`}>
      <div className="chat-user">
        <img src={assets.arrow_icon} onClick={()=>setChatVisible(false)} className='arrow' alt="" />
        <img src={chatUser.userData.avatar || assets.profile_img} alt="user avatar" />
        <p>
          {chatUser.userData.name}{Date.now()-chatUser.userData.lastSeen <= 70000 ? <img className="dot" src={assets.green_dot} alt="online status" />:null}
          
        </p>
        <img src={assets.help_icon} className="help" alt="help icon" />
        
      </div>

      <div className="chat-msg">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sId === userData.id ? 's-msg' : 'r-msg'}>
            {msg.image ? (
              <img className="msg-img" src={msg.image} alt="sent image" />
            ) : (
              <p className="msg">{msg.text}</p>
            )}
            <div>
              <img
                src={
                  msg.sId === userData.id
                    ? userData.avatar || assets.profile_img
                    : chatUser.userData.avatar || assets.profile_img
                }
                alt="user"
              />
              <p>{convertTimestamp(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />
        <input
          onChange={sendImage}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="upload" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="send" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible?"":"hidden"}`}>
      <img src={assets.logo_icon} alt="logo" />
      <p>Text Light. Feel Heavy</p>
    </div>
  );
};

export default ChatBox;
