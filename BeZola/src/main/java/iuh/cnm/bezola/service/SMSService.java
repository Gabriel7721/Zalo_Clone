package iuh.cnm.bezola.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import iuh.cnm.bezola.models.SMS;
import iuh.cnm.bezola.models.StoreOTP;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.text.ParseException;

@Service
public class SMSService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.from.number}")
    private String fromNumber;

    public void send(SMS sms) throws ParseException {
        Twilio.init(accountSid, authToken);

        int min = 100000;
        int max = 999999;
        int otp = (int) (Math.random() * (max - min + 1) + min);

        Message message = Message.creator(
                        new PhoneNumber(sms.getPhoneNo()),
                        new PhoneNumber(fromNumber),
                        "Your OTP is: " + otp)
                .create();

        StoreOTP.setOtp(otp);
    }

    public void receive(MultiValueMap<String, String> smsCallback) {
        // Handle incoming SMS here
    }
}
