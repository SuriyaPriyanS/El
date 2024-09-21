function convertSecondsToDuration(totalSeconds){
    const hours = Math.floor(totalSeconds/3600)
    const minutes = Math.floor((totalSeconds%3600)/60)
    const seconds = Math.floor((totalSeconds % 3600) %60)

    if(hours > 0 ){
        return `${hours} ${minutes} ${seconds}`
    }
    else if (minutes > 0){
        return `${minutes} ${seconds}`
    }
    else{
        return `${seconds} seconds`
    }
}

