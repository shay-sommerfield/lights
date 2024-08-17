#include <Arduino.h>
#define BUTTON 10

int buttonState;
// void button_pushed(){

// }

void setup() {
  // put your setup code here, to run once:
  pinMode(BUTTON,INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  // put your main code here, to run repeatedly:

  // button was just pushed
  buttonState = digitalRead(BUTTON);
  // Serial.print("the button state is: ");
  // Serial.println(buttonState);

if(Serial.available()){
    Serial.read();
    if(buttonState){
     Serial.println(true);
     delay(100);
  }
  //button just went back up
  else{
    Serial.println(false);
    delay(100);
  }
}




}
