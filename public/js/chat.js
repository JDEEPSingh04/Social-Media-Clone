const allMessages = document.getElementById('allMessages')
allMessages.scrollTop = allMessages.scrollHeight

// Initialize Socket.IO connection
const socket = io() // Connect to the server

// Emit events to the server

// Update message history when receiving a message
socket.on('newMessage', (message) => {
  const user1 = document.getElementById('user1').value
  const user2 = document.getElementById('user2').value
  const dp1 = document.getElementById('dp1').value
  const dp2 = document.getElementById('dp2').value
  console.log('${/images/uploads/dp1}')
  console.log('/images/uploads/${dp2}')
  // Check if the message is to be displayed on this page or not
  if (
    (user1 == message.sender && user2 == message.reciever) ||
    (user1 == message.reciever && user2 == message.sender)
  ) {
    const newMessageElement = document.createElement('div')
    newMessageElement.classList.add('incoming_msg') // Add the main class

    // Add classes for individual elements within the message
    const incomingMsgImg = document.createElement('div')
    incomingMsgImg.classList.add('incoming_msg_img')

    const profilePic = document.createElement('img')
    profilePic.classList.add('profile-pic')
    if (user1 == message.sender)
      profilePic.src = `/images/uploads/${dp1}` // Set image source
    else profilePic.src = `/images/uploads/${dp2}` // Set image source
    profilePic.alt = 'profilePic'

    const receivedMsg = document.createElement('div')
    receivedMsg.classList.add('received_msg')

    const receivedWithdMsg = document.createElement('div')
    receivedWithdMsg.classList.add('received_withd_msg')

    const messageContent = document.createElement('p')
    messageContent.textContent = message.content // Set message content

    const timeDate = document.createElement('span')
    timeDate.classList.add('time_date')
    timeDate.textContent = message.elapsedTime // Set timestamp

    // Build the structure by appending child elements
    incomingMsgImg.appendChild(profilePic)
    receivedWithdMsg.appendChild(messageContent)
    receivedWithdMsg.appendChild(timeDate)
    receivedMsg.appendChild(receivedWithdMsg)
    newMessageElement.appendChild(incomingMsgImg)
    newMessageElement.appendChild(receivedMsg)

    // Add the new message
    allMessages.appendChild(newMessageElement)
    allMessages.scrollTop = allMessages.scrollHeight
  }
})
