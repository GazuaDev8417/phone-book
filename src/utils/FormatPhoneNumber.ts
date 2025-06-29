const formatPhoneNumber = (phone:string)=>{
    const digits = phone.replace(/\D/g, '')

    if(digits.length <= 10){
        return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
    }

    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
}


export default formatPhoneNumber