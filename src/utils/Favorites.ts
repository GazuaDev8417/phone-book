import AsyncStorage from "@react-native-async-storage/async-storage"
const FAVORITES_KEY = 'favoriteContacts'





export const getFavorites = async():Promise<string[]>=>{
    const json = await AsyncStorage.getItem(FAVORITES_KEY)
    return json ? JSON.parse(json) : []
}


export const addFavorite = async(contactId:string)=>{
    const favorites = await getFavorites()
    if(!favorites.includes(contactId)){
        favorites.push(contactId)
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    }
}


export const removeFavorites =  async(contactId:string)=>{
    const favorites = await getFavorites()
    const upadated = favorites.filter(id => id !== contactId)
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(upadated))
}


export const toggleFavorite = async(contactId:string)=>{
    const favorites = await getFavorites()
    if(favorites.includes(contactId)){
        await removeFavorites(contactId)
    }else{
        await addFavorite(contactId)
    }
}