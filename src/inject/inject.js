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

		var get_sender_id = function(message){
			var a=$(message).find("a.c-message__avatar")[0]
			if (a === undefined){
				var prev = message.previousSibling;
				if (prev === null){
					return "";
				}
				return get_sender_id(prev);
			}
			var user_id = a.href.substring(a.href.lastIndexOf('/')+1);
			return user_id;
		}

		var should_hide_message = function(message){
			var senderId = get_sender_id(message)
			return Boolean(blockedUsers.indexOf(senderId) > -1)
		}

		var hide_message = function(message){
			message.style.display = "none";
		}

		var handle_message = function(message){
			if (should_hide_message(message)){
				hide_message(message)
			}
		}

		var handle_history = function(){
			messages = $("div.c-virtual_list__item")
			for (i=0; i<messages.length; i++){
				handle_message(messages[i])
			}
		}

		message_div = $('#messages_container') // Parent div that contains messages

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

			handle_history();

			// Add function to be called everytime a new node is inserted in message_div
			message_div.bind('DOMNodeInserted', function(event){
				if (onlyBlockDMs && !is_dm_window()) {
					return
				}

				event_target = event.target;

				// Handle new incoming messages
				if (event_target.classList.contains("c-virtual_list__item")){
					handle_message(event_target)
				} 

				// Handle message history loading
				else if (event_target.classList.contains("c-virtual_list")){
					handle_history();
				}

			})
		});
	}
	}, 10);
});
