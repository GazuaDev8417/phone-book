import React from "react"
import { TouchableOpacity } from "react-native"
import { MaterialIcons } from '@expo/vector-icons'



interface Props{
    isFavorite: boolean
    setIsFavorite: (value:boolean) => void
}

const FavoriteStar:React.FC<Props> = ({ isFavorite, setIsFavorite })=>{


    const handleToggle = async()=>{
        setIsFavorite(!isFavorite)
    }


    return(
        <TouchableOpacity onPress={handleToggle}>
            <MaterialIcons
                name={isFavorite ? 'star' : 'star-border'}
                size={35}
                color={isFavorite ? 'gold' : 'gray'}/>
        </TouchableOpacity>
    )
}


export default FavoriteStar