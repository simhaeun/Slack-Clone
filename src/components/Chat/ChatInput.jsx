import { Grid, IconButton, InputAdornment, LinearProgress, TextField } from '@mui/material'
import React, { useCallback, useState } from 'react'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import ImageIcon from '@mui/icons-material/Image'
import SendIcon from '@mui/icons-material/Send'
import '../../firebase'
import { getDatabase, push, ref, serverTimestamp, set } from 'firebase/database'
import { useSelector } from 'react-redux'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import ImageModal from '../Modal/ImageModal'

function ChatInput() {
    const { channel, user } = useSelector(state => state);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [percent, setPercent] = useState(0);

    const handleClickOpen = useCallback(() => setImageModalOpen(true),[]);
    const handleClickClose = useCallback(() => setImageModalOpen(false),[]);
    const handleTogglePicker = useCallback(() => setShowEmoji((show) => !show),[]);
    const handleChange = useCallback((e) => setMessage(e.target.value),[]);

    const createMessage = useCallback(() => ({
        timestamp: serverTimestamp(), 
        user:{
            id: user.currentUser.uid, 
            name: user.currentUser.displayName, 
            avatar: user.currentUser.photoURL
        },
        content: message
    }),[message, user.currentUser.uid, user.currentUser.displayName, user.currentUser.photoURL])

    const clickSendMessage = useCallback(async () => {
        if(!message) return
        setLoading(true)
        try {
            await set(
                push(ref(getDatabase(), 'messages/' + channel.currentChannel.id)),
                createMessage()
            );
            setLoading(false)
            setMessage('')
        } catch (error) {
            console.error(error)
            setLoading(false)
        }
    },[message, createMessage, channel.currentChannel?.id])
    
    const handleSelectEmoji = useCallback((e) => {
        const sym = e.unified.split('-');
        const codesArray = [];
        sym.forEach(el => codesArray.push('0x' + el));
        const emoji = String.fromCodePoint(...codesArray);
        setMessage((messageValue) => messageValue + emoji)
    },[])

  return (
    <Grid container sx={{p: '20px'}} >
        <Grid item xs={12} sx={{position: 'relative'}}>
            {showEmoji && (
                <Picker
                    data={data}
                    onEmojiSelect={handleSelectEmoji}
                />
            )}
            <TextField
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                            <IconButton onClick={handleTogglePicker}>
                                <InsertEmoticonIcon/> 
                            </IconButton>
                            <IconButton onClick={handleClickOpen}>
                                <ImageIcon/>
                            </IconButton>
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position='start'>
                            <IconButton disabled={loading} onClick={clickSendMessage}>
                                <SendIcon/>
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                autoComplete='off'
                label='메세지 입력'
                fullWidth
                value={message}
                onChange={handleChange}
            />
            {
                uploading ? <Grid item xs={12} sx={{m: '10px'}}>
                    <LinearProgress variant='determinate' value={percent}/>
                </Grid>
                : null
            }
            <ImageModal 
                open={imageModalOpen} 
                handleClose={handleClickClose}
                setPercent={setPercent}
                setUploading={setUploading}
            />
        </Grid>
    </Grid>
  )
}

export default ChatInput