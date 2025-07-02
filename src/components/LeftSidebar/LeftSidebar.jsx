import React, { useContext, useEffect, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const {
    userData,
    chatData,
    chatUser,
    setChatUser,
    setMessagesId,
    messagesId,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);

  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input.toLowerCase()));
        const querySnap = await getDocs(q);

        if (!querySnap.empty && querySnap.docs[0].data().id !== userData?.id) {
          const foundUser = querySnap.docs[0].data();
          const exists = chatData?.some((chat) => chat.rId === foundUser.id);
          setUser(!exists ? foundUser : null);
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
        setUser(null);
      }
    } catch (error) {
      toast.error("Search failed.");
      console.error(error);
    }
  };

  const addChat = async () => {
    try {
      const messagesRef = doc(collection(db, "messages"));
      await setDoc(messagesRef, {
        createAt: serverTimestamp(),
        messages: [],
      });

      const chatPayload = {
        messageId: messagesRef.id,
        lastMessage: "",
        rId: userData.id,
        updatedAt: Date.now(),
        messageSeen: true,
      };

      const myChat = { ...chatPayload, rId: user.id };
      const theirChat = { ...chatPayload, rId: userData.id };

      await updateDoc(doc(db, "chats", user.id), {
        chatsData: arrayUnion(theirChat),
      });

      await updateDoc(doc(db, "chats", userData.id), {
        chatsData: arrayUnion(myChat),
      });

      toast.success("Chat created");

      const uSnap = await getDoc(doc(db, "users", user.id));
      const uData = uSnap.data();

      setMessagesId(messagesRef.id);
      setChatUser({
        messageId: messagesRef.id,
        lastMessage: "",
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
        rId: user.id,
      });

      setShowSearch(false);
      setUser(null);
      setChatVisible(true);
    } catch (error) {
      toast.error("Failed to add chat");
      console.error(error);
    }
  };

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);

      const userChatRef = doc(db, "chats", userData.id);
      const userChatSnap = await getDoc(userChatRef);
      const userChatData = userChatSnap.data();

      const chatIndex = userChatData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      );

      if (chatIndex !== -1) {
        userChatData.chatsData[chatIndex].messageSeen = true;
        await updateDoc(userChatRef, {
          chatsData: userChatData.chatsData,
        });
        setChatVisible(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const updateChatUserData = async () => {
      if (chatUser) {
        const userRef = doc(db, "users", chatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser((prev) => ({ ...prev, userData }));
      }
    };
    updateChatUserData();
  }, [chatData]);

  return (
    <div className={`ls ${chatVisible ? "hidden" : ""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo_white} alt="" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={()=>logout()}>Logout</p>
            </div>
          </div>
        </div>
        <h2>Chats</h2>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar || assets.profile_img} alt="user" />
            <p>{user.name}</p>
          </div>
        ) : (
          chatData?.map((item, index) => (
            <div
              onClick={() => setChat(item)}
              key={index}
              className={`friends ${
                item.messageSeen || item.messageId === messagesId ? "" : "border"
              }`}
            >
              <img
                src={item.userData?.avatar || assets.profile_img}
                alt="friend"
              />
              <div>
                <p>{item.userData?.name || "Unknown"}</p>
                <span>{item.lastMessage}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
