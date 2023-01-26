import { Avatar, Grid, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import dayjs from 'dayjs'
import React from 'react'

const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime)

// 이미지 메시지인지, 텍스트 메시지인지 판별
const IsImage = (message) => message.hasOwnProperty('image');

function ChatMessage({message, user}) {
  return (
    <ListItem>
        <ListItemAvatar sx={{alignSelf: 'stretch'}}>
            <Avatar 
                sx={{width: 50, height: 50}} 
                alt='Profile Image'
                src={message.user.avatar}
            />
        </ListItemAvatar>
        <Grid container sx={{ml: 2}}>
            <Grid item xs={12} sx={{display: 'flex', justifyContent: 'left'}}>
                <ListItemText
                    sx={{display: 'flex'}} 
                    primary={message.user.name} 
                    primaryTypographyProps={{fontWeight: 'bold', color: message.user.id === user.currentUser.uid ? 'orange' : 'black'}}
                    secondary={dayjs(message.timestamp).fromNow()}
                    secondaryTypographyProps={{color: 'gray', ml: 1}}
                />
            </Grid>
            <Grid item xs={12}>
                {
                    IsImage(message) 
                        ? <img alt='img message' src={message.image} style={{maxWidth: '100%'}} />
                        : <ListItemText align='left' sx={{wordBreak: 'break-all'}} primary={message.content}/>
                }
            </Grid>
        </Grid>
    </ListItem>
  )
}

export default ChatMessage