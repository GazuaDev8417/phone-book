import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as Contacts from 'expo-contacts'
import { Contact } from 'expo-contacts'
import { Feather } from '@expo/vector-icons'
import ContactSolo from './src/component/ContactSolo'
import AddContactForm from './src/component/AddContactForm'
import FavoriteStar from './src/utils/FavoriteStar'
import { getFavorites, toggleFavorite } from './src/utils/Favorites'
import { StyleSheet, Text, View, StatusBar, FlatList, TouchableOpacity, Modal, TextInput, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'








export default function App() {
  const flatlistRef = useRef<FlatList>(null)
  const [contacts, setContacts] = useState<Contact[] | undefined>()
  const [contact, setContact] = useState<Contact | null>()
  const [showContact, setShowContact] = useState<boolean>(false)
  const [showAddContact, setShowAddContact] = useState<boolean>(false)
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [favoritesMap, setFavoritesMap] = useState<Record<string,boolean>>({})
  
  



  useEffect(()=>{
    getAllContacts()
    loadFavorites()
  }, [])

  const getAllContacts = async()=>{
    const { status } = await Contacts.requestPermissionsAsync()
    if(status !== 'granted'){
      alert('Permissão para acessar contatos negada')
      return
    }

    const { data } = await Contacts.getContactsAsync()

    if(data.length > 0){      
      setContacts(data)
    }else{
      console.log('Lista de cotatos vazia')
    }
  }


  const handlePress = async(id:string)=>{
    const contato = await Contacts.getContactByIdAsync(id, [
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Emails,
      Contacts.Fields.Addresses,
    ])
    setContact(contato)
    setShowContact(true)
  }

  const handleScroll = (event:NativeSyntheticEvent<NativeScrollEvent>)=>{
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height 

    setIsAtBottom(isBottom)
  }


  const filteredContacts = contacts && contacts.filter(item=>{
        return item.name.toLowerCase().includes(search.toLowerCase())
  })


  const loadFavorites = async()=>{
    const favs = await getFavorites()
    const map:Record<string, boolean> = {}
    favs.forEach(id => (map[id] = true))
    setFavoritesMap(map)
  }

  const toggleFavoriteForId = useCallback(async(id:string)=>{
    await toggleFavorite(id)
    setFavoritesMap(prev =>({
      ...prev, [id]: !prev[id]
    }))
  }, [setFavoritesMap])


  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' />

      <Modal
        visible={showContact}
        animationType='slide'
        transparent={false}
        onRequestClose={() => setShowContact(false)}>
          <ContactSolo 
            contact={contact ?? null} 
            setShowContact={setShowContact}
            isFavorite={!!favoritesMap[contact?.id ?? '']}
            toggleFavorite={() => contact?.id && toggleFavoriteForId(contact.id)}/>          
      </Modal>
      <Modal
        visible={showAddContact}
        animationType='slide'
        transparent={false}
        onRequestClose={() => setShowAddContact(false)}>

          <AddContactForm setShowAddContact={setShowAddContact} />
      </Modal>
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name='user-plus' size={30}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowAddContact(true)}>
          <Feather name='user-plus' size={30}/>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Lista de Contatos</Text>
      <TextInput
        placeholder="Nome de produto..."
        value={search}
        onChangeText={setSearch}
        style={{
            borderWidth: 1,
            borderRadius: 20,
            height: 40,
            marginTop: 50,
            marginHorizontal: 10,
            paddingLeft: 10,
            borderColor: '#ccc'}}/>
      <TouchableOpacity style={[styles.btnScroll, {backgroundColor:isAtBottom ? 'red' : 'green'}]}
        onPress={()=>{
          if(isAtBottom){
            flatlistRef.current?.scrollToOffset({ offset: 0, animated: true })
          }else{
            flatlistRef.current?.scrollToEnd({ animated: true })
          }
        }}
        >
        <Text style={{textAlign:'center', color:'white'}}>
          {isAtBottom ? 'Voltar ao topo ↑' : 'Ir para o fim da lista ↓'}
        </Text>
      </TouchableOpacity>
      <FlatList
        ref={flatlistRef}
        data={filteredContacts}
        onScroll={handleScroll}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const phoneNumbers = item.phoneNumbers
          return(
            <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
              <TouchableOpacity style={styles.content} onPress={() => handlePress(item.id!)} >
                <Text>Nome: {item.name}</Text>
                <Text>
                  Número: {phoneNumbers?.[0]?.number ?? 'Sem número'}
                </Text>
                <Text>Tipo de contato: {item.contactType === 'person' ? 'Pessoa' : 'Empresa'}</Text>
              </TouchableOpacity>
              <FavoriteStar 
                isFavorite={!!favoritesMap[item.id!]}
                setIsFavorite={() => toggleFavoriteForId(item.id!)}/>
            </View>
          )
        }}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40
  },
  content: {
    borderWidth: 1,
    width: 300,
    marginVertical: 10,
    marginLeft: 20,
    padding: 10,
    borderRadius: 10
  },
  header: {
    marginTop: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10
  },
  title: {
    fontSize: 20,
    textAlign: 'center'
  },
  btnScroll: {
    marginHorizontal: 70,
    marginVertical: 10,
    padding: 5,
    borderRadius: 10,
    height: 30
  }
});
