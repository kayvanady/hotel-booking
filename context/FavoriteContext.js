import { createContext, useContext, useEffect, useState } from "react";

const favoriteContext = createContext();

export default function FavoriteProvider({ children }) {
  const [favorite, setFavorite] = useState([]);

  useEffect(() => {
    ()=>{
      const stored = localStorage.getItem('roomFavorites')
      stored ? setFavorite(JSON.parse(stored)) : []
    }
    
    
  }, []);
  useEffect(() => {
    localStorage.setItem("roomFavorites", JSON.stringify(favorite));
  }, [favorite]);

  const addFavorite = (room) => {
    setFavorite((prev) => {
      const existes = prev.some((item) => item._id === room._id);
      if (existes) return prev;
      return [...prev, room];
    });
  };

  const removeFavorite = (roomId) => {
    setFavorite((prev) => prev.filter((item) => item._id !== roomId));
  };

  return (
    <favoriteContext.Provider value={{ addFavorite, removeFavorite, favorite }}>
      {children}
    </favoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(favoriteContext);
  return context;
}
