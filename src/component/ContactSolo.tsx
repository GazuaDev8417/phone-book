import React, { useEffect, useState, useCallback } from "react"
import * as Contacts from 'expo-contacts'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Contact } from "expo-contacts"
import { Feather, Ionicons } from '@expo/vector-icons'
import AddNoteContent from "./AddNoteContent"
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, FlatList } from 'react-native'



type ContactProps = {
     contact: Contact | null
     setShowContact: (value:boolean) => void
}


type Notes = {
    id:number
    content:string
}




const ContactSolo = ({ setShowContact, contact }: ContactProps)=>{
    const [imageUri, setImageUri] = useState<string | null>(null)
    const [showModal, setShowModal] = useState<boolean>(false)
    const [notes, setNotes] = useState<Notes[]>([])
    const [refreshing, setRefreshing] = useState(false);




    const wait = (timout:number)=>{    
    return new Promise(resolve => setTimeout(resolve, timout))
    }


    const onRefresh = useCallback(()=>{
        getNotes()
        setRefreshing(true)    
        wait(2000).then(()=> setRefreshing(false))
    }, [])
    


    useEffect(()=>{
        const fetchFullContact = async()=>{
            if(contact?.id){
                const full = await Contacts.getContactByIdAsync(contact.id)
                if(full?.imageAvailable && full?.image?.uri){
                    setImageUri(full.image.uri)
                }
            }
        }
        fetchFullContact()
        getNotes()
    }, [contact])



    const getNotes = async()=>{
        if(!contact?.id){
            console.warn('Contato invákudo!')
            return
        }

        const NOTE_KEY = contact.id
        try{
            const allNotes =  await AsyncStorage.getItem(NOTE_KEY)
            setNotes(allNotes ? JSON.parse(allNotes) : [])
        }catch(e){
            console.log(`Erro mostrar anotações: ${e}`)
            return []
        }
    }

    const loadNotes = async(newNotes:Notes[])=>{
        if(!contact?.id){
            console.warn('Contato invákudo!')
            return
        }

        const NOTE_KEY = contact.id
        try{
            await AsyncStorage.setItem(NOTE_KEY, JSON.stringify(newNotes))
        }catch(e){
            console.log(`Erro ao carregar anotações: ${e}`)
        }
    }

    const deleteNotes = async(id:number)=>{
        const updateNotes = notes.filter(n => n.id !== id)
        setNotes(updateNotes)
        await loadNotes(updateNotes)
    }


    const saveImage = async(imageSrc:string)=>{
        try{
            const newPath = imageSrc.split('/').pop()

            if(!newPath){
                throw new Error('Faltando diretório ou nome do arquivo')
            }

            
            return newPath
        }catch(e){
            console.error(`Erro salvar image: ${e}`)
        }
    }


    const pickImage = async()=>{
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if(status !== 'granted'){
            alert('Sem permissão de acesso a mídia')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        })

        if(!result.canceled){   
            const newUri = await saveImage(result.assets[0].uri)
            setImageUri(result.assets[0].uri)
        }
    }

    
    



    return(
        <View style={styles.container}>
            <TouchableOpacity 
                style={{position:'absolute', right:20, top:20}}
                onPress={() => setShowContact(false)}>
                <Feather name="x-circle" size={25}/>
            </TouchableOpacity>
            <View style={styles.top}>
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}/>
                ) : (
                    <TouchableOpacity onPress={pickImage}>
                        <Ionicons name="person-circle" size={150} color='gray'/>
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{contact?.firstName}</Text>
            </View>
            <View style={styles.contactData}>
                <Text style={styles.contactProperties}>Nome:
                    <Text style={styles.propertieValues}> {contact?.name}</Text>
                </Text>
                <Text style={styles.contactProperties}>Número:
                    <Text style={styles.propertieValues}> {contact?.phoneNumbers?.[0]?.number ?? 'Sem número'}</Text>
                </Text>
                <Text style={styles.contactProperties}>Tipo:
                    <Text style={styles.propertieValues}> {contact?.contactType === 'person' ? 'Pessoa' : 'Empresa'}</Text>
                </Text>
                <Text style={styles.contactProperties}>Favoritos:
                    <Text style={styles.propertieValues}> {contact?.isFavorite ? 'Sim' : 'Não'}</Text>
                </Text>
                <Text style={styles.contactProperties}>Com imagem:
                    <Text style={styles.propertieValues}> {contact?.imageAvailable ? 'Sim' : 'Não'}</Text>
                </Text>
            </View>
            <Modal
                visible={showModal}
                animationType='slide'
                transparent={false}
                onRequestClose={() => setShowModal(false)}>        
                    <AddNoteContent setShowModal={setShowModal} contact={contact} getNotes={getNotes} />
            </Modal>
            <View style={styles.notes}>
                <View style={styles.notesTitleContainer}>
                    <Text style={styles.notesTitle}>Anotações</Text>
                    <TouchableOpacity onPress={() => setShowModal(true)}>
                        <Feather name="plus-circle" size={25}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.notesContent}>
                    <FlatList
                        data={notes}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{paddingTop:30}}
                        renderItem={({ item }) =>(
                            <View style={styles.note}>
                                <Text>{item.content}</Text>
                                <TouchableOpacity 
                                    style={{alignItems:'center'}}
                                    onPress={() => deleteNotes(item.id)}>
                                    <Feather name="trash-2" size={25} color='red' />
                                </TouchableOpacity>
                            </View>
                        )}
                        refreshing={refreshing}
                        onRefresh={onRefresh}/>
                </View>
            </View>
        </View>
    )
}


export default ContactSolo



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    top: {
        marginTop: 50,
        alignItems: 'center'
    },
    title: {
        fontSize: 20
    },
    contactData: {
        marginTop: 50,
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
    },
    contactProperties: {
        fontWeight: 'bold',
        fontSize: 20
    },
    propertieValues: {
        fontWeight:'normal'
    },
    notes: {
        alignItems: 'center',
        marginTop: 30
    },
    notesTitle: {
        fontSize: 18
    },
    notesContent: {
        height: 300
    },
    notesTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    note: {
        borderWidth:1,
        marginBottom:5,
        borderRadius:5, 
        padding:5,
        alignItems: 'center',
        gap: 20,
        width: 300
    }
})