# Roadmap

## Current phase
Prototype first.

## Current step
[x] Homepage scaffold.
[x] Alojamento page scaffold
[x] Galeria page scaffold
[x] Reservas page scaffold
[x] Reserva enviada page scaffold
[] Contacto page scaffold
[] Guia-local
   []

## Small changes to implement next
Fixes:
Change "Refúgio" to "O Refúgio", in titles and other things when it makes sense

Add optional bike reservations to the booking page. One available per person, per day (can book for only 1-2 days even for a multiple day stay for example). The price is 5€ per bike per day.

Add a Add Google Maps review button everywhere where it makes sense: https://www.google.com/maps/place/O+Ref%C3%BAgio/@41.0204811,-8.3871842,646m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd24830c21a7821f:0x7babb9259b50311a!8m2!3d41.0204812!4d-8.3823133!16s%2Fg%2F11vqhfvg0k?entry=ttu&g_ep=EgoyMDI2MDQyMC4wIKXMDSoASAFQAw%3D%3D

There's actually TVs in all rooms, not only in the bunk bedroom

Addition:
Design the contacto.html. Here are all the features I want to be in it, but I'll let you structure it and properly layout:
- Message entry
    - name
    - email
    - phone number (and checkboxes prefered to be contacted by WhatsApp call or message)
    - context for the contact
        - checkbox [I already have a reservation]
            - cancel reservation
            - change reservation
            - questions about reservation
        - checkbox [I made a reservation request]
            - cancel reservation request
            - change reservation request
            - questions about reservation request
        - - checkbox [I don't have a reservation]
            - questions about reserving
            - questions about the place
            - I stayed here and have feedback
            - other
            - (you can add/change stuff here if you think there's better stuff)
- Contact numbers based on language, mentioning that they can be contacted via WhatsApp, if possible with a copy paste button to copy the number easily or even coded so it automatically adds the contact into android and apple devices, make what is possible
    - I'm already staying in : Portuguese, English: Ana -> +351(placeholder)
    - Other: 
        - Portuguese, French : Paula -> +41783518222
        - Portuguese, French : Jorge -> +41774694144
        - Portuguese, French, English, Spanish : Bárbara -> +351927460563
        - Portuguese, French, English, German : Marlene -> +41767862024
- Social media
- Anything else you may think of

## Small additions to not forget
Change default language based on browser defaults

Emergency contacts in the Guia Local 

404.thml

Tick for promotions, deals, news, ... 

Mud-Wasp warning

Add imbed Google maps (with pins for the different rooms?) in the Alojamento page and the address in the Homepage