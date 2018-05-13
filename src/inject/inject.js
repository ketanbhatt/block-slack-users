chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		blockedUsers = [];
		onlyBlockDMs = false;
		enableExtension = false;

		var is_dm_window = function(){
			var channel_title_div = $('#channel_title')[0]
			return channel_title_div == undefined  // DMs do not have a DOM element with this ID
		}

		var get_sender_id = function(message, is_thread=false){
			var senderId = undefined

			if (is_thread) {
				senderId = message.getAttribute('data-member-id')
				if (senderId == ""){
					senderId = message.getAttribute('data-bot-id')	
				}
			} else {
				senderId = message.getElementsByClassName('c-message__avatar')[0]
				if (senderId != undefined) {
					senderId = senderId.href.split('/').pop()
				}
			}

			return senderId
		}
		var should_hide_message = function(message, is_thread){
			senderId = get_sender_id(message, is_thread)
			return Boolean(blockedUsers.indexOf(senderId) > -1)
		}
		var hide_message = function(message){
			message.style.display = "none";
		}

		var handle_message = function(message, is_thread){
			if (should_hide_message(message, is_thread)){
				hide_message(message)
			}
		}

		message_div = $('#messages_container')  // Parent div that contains main messages
		thread_div = $('#flex_contents')  // Parent div that contains threads in sidebar

		chrome.storage.sync.get({
			blockedUsers: "",
			onlyBlockDMs: false,
			enableExtension: true
		}, function(items) {
			blockedUsers = items.blockedUsers.split(',');
			onlyBlockDMs = items.onlyBlockDMs;
			enableExtension = items.enableExtension;

			if (enableExtension == false){
				return
			}

			// Add function to Remove messages from the main window
			message_div.bind('DOMNodeInserted', function(event){
				if (onlyBlockDMs && !is_dm_window()) {
					return
				}

				event_target = event.target;

				// Handle new incoming messages
				if (event_target.className == "c-virtual_list__item"){
					handle_message(event_target, false)
				} 

			})

			// Add function to Remove messages from threads
			thread_div.bind('DOMNodeInserted', function(event){
				event_target = event.target;

				console.log("DEBUG:: THREAD", event, event_target.tagName)

				// Handle new incoming thread messages
				if (event_target.tagName == "TS-MESSAGE"){
					handle_message(event_target, true)
				} 

				// Handle Thread history loading
				else if (event_target.className == 'day_container'){
					messages = event_target.getElementsByTagName('ts-message')
					for (i=0; i<messages.length; i++){
						handle_message(messages[i], true)
					}
				}

			})

			// Handle main messages' history
			all_messages = $('.c-virtual_list__item')
			for (i=0; i<all_messages.length; i++){
				handle_message(all_messages[i], false)
			}

			// Handle thread's history
			messages = document.getElementsByTagName('ts-message')
			for (i=0; i<messages.length; i++){
				handle_message(messages[i], true)
			}

		});
	}
	}, 10);
});