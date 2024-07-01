package iuh.cnm.bezola.service;

import iuh.cnm.bezola.models.Message;
import iuh.cnm.bezola.repository.MessageRepository;
import iuh.cnm.bezola.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final RoomService roomService;

    public Message save(Message message) {
        var chatId = roomService.getRoomId(message.getSenderId(), message.getRecipientId(), true)
                .orElseThrow(() -> new RuntimeException("Cannot create chatId"));
        message.setChatId(chatId);
        messageRepository.save(message);
        return message;
    }

    public List<Message> findMessages(String senderId, String recipientId) {
        var chatId = roomService.getRoomId(senderId, recipientId, false);
        return chatId.map(messageRepository::findAllByChatId).orElse(new ArrayList<>());
    }
}
