import { useState } from "react"
import * as Contacts from 'expo-contacts'
import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"




const AddContactForm = ({ setShowAddContact }: { setShowAddContact: (value:boolean) => void })=>{
    const [contactName, setContactName] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [contactType, setContactType] = useState<string>('')
    const [address, setAddress] = useState<string>('')




    const addContact = async()=>{
        try{
            const { status } = await Contacts.requestPermissionsAsync()
            if(status !== 'granted'){
                alert('Permissão para acessar contatos negada')
                return
            }

            const contact = {
                name: contactName,
                contactType: contactType === 'Pessoa' ? Contacts.ContactTypes.Person : Contacts.ContactTypes.Company,
                [Contacts.Fields.FirstName]: contactName,
                [Contacts.Fields.PhoneNumbers]: [{
                    label: 'mobile',
                    number: phone
                }],
                [Contacts.Fields.Emails]: [{
                    label: 'work',
                    email: email
                }],
                [Contacts.Fields.Addresses]: [{
                    label: 'home',
                    street: address
                }]
            }

            await Contacts.addContactAsync(contact)
            alert(`${contactName} salvo com sucesso`)

        }catch(e){
            console.error(`Erro ao salvar contato: ${e}`)
        }
    }


    const cleanForm = ()=>{
        setContactName('')
        setPhone('')
        setEmail('')
        setAddress('')
    }




    return(
        <View style={styles.container}>
            <TouchableOpacity 
                style={{position:'absolute', right:20, top:20}}
                onPress={() => setShowAddContact(false)}>
                <Feather name="x-circle" size={25}/>
            </TouchableOpacity>
            <Text style={styles.title}>Adicionar Contato</Text>
            <ScrollView>
                <TextInput
                    style={[styles.input, {textTransform:'capitalize'}]}
                    placeholder="Nome"
                    value={contactName}
                    onChangeText={setContactName}/>
                <TextInput
                    style={styles.input}
                    placeholder="Telefone"
                    keyboardType="numeric"
                    value={phone}
                    onChangeText={setPhone}/>
                <Picker style={styles.select}
                    selectedValue={contactType}
                    onValueChange={(itemValue) => setContactType(itemValue)}>
                    <Picker.Item label='Tipo de contato' value=''/>
                    <Picker.Item label='PESSOA' value='Pessoa'/>
                    <Picker.Item label='EMPRESA' value='Empresa'/>
                </Picker>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}/>
                <TextInput
                    style={styles.input}
                    placeholder="Endereço"
                    value={address}
                    onChangeText={setAddress}/>
                <View style={styles.btnContainer}>
                    <TouchableOpacity 
                        style={[styles.button, {backgroundColor:'#8B0000'}]}
                        onPress={cleanForm} >
                        <Text style={styles.btnText}>Limpar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={addContact} >
                        <Text style={styles.btnText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}



export default AddContactForm




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
        height: 40,
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