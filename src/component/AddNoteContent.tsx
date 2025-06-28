import React, { useState } from "react"
import { Contact } from "expo-contacts"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Feather } from '@expo/vector-icons'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"




type ContactProps = {
     contact: Contact | null
     setShowModal: (value:boolean) => void
     getNotes: () => void
}


const AddNoteContent = ({ setShowModal, contact, getNotes }: ContactProps)=>{
    const [note, setNote] = useState<string>('')
    


    const addNote = async()=>{
        if(note === ''){
            alert('Insira alguma anotação')
            return
        }
        
        if(!contact?.id){
            console.warn('Contato inválido!')
            return
        }

        const NOTE_KEY = contact.id
        try{
            const existing  = await AsyncStorage.getItem(NOTE_KEY)
            const notes = existing ? JSON.parse(existing) : []
            notes.push({ id: Date.now(), content: note })
            await AsyncStorage.setItem(NOTE_KEY, JSON.stringify(notes))
            setShowModal(false)
            getNotes()
        }catch(e){
            console.error(`Erro ao armazenzar contato: ${e}`)
        }
    }

    

    const cleanForm = ()=>{
        setNote('')
    }




    return(
        <View style={styles.container}>
            <TouchableOpacity 
                style={{position:'absolute', right:20, top:20}}
                onPress={() =>{
                    setShowModal(false)
                    getNotes()
                }}>
                <Feather name="x-circle" size={25}/>
            </TouchableOpacity>
            <Text style={styles.title}>Anotação do(a) {contact?.firstName}</Text>
            <ScrollView>
                <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    multiline={true}
                    value={note}
                    onChangeText={setNote}/>
                
                <View style={styles.btnContainer}>
                    <TouchableOpacity 
                        style={[styles.button, {backgroundColor:'#8B0000'}]}
                        onPress={cleanForm} >
                        <Text style={styles.btnText}>Limpar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={addNote}
                        style={styles.button}>
                        <Text style={styles.btnText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}



export default AddNoteContent




const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    title: {
        fontSize: 20,
        marginTop: 50,
        marginBottom: 30,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        margin: 10,
        height: 150,
        paddingLeft: 10
    },
    select: {
        backgroundColor: 'whitesmoke',
        fontSize: 15,
        margin: 10,
        height: 50
    },
    btnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginTop: 20
    },
    button: {
        backgroundColor: '#006400',
        padding: 10,
        borderRadius: 10
    },
    btnText: {
        color: 'white'
    }
})