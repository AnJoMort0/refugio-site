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

## Small changes to implement next
Here's feedback from another AI agent I would follow:
Main changes I’d make
Make it feel less legally heavy at first
The rules section is very complete, but for users it may feel intimidating. I’d keep the full rules, but add a softer intro like:

Antes de enviar o pedido, pedimos apenas que confirme alguns pontos importantes para garantir uma estadia tranquila.

Add a “this is not automatic confirmation” notice near the submit button
You mention it in the email warning, but it should be extremely clear beside the button:

Este pedido não confirma automaticamente a reserva. A confirmação será enviada por email após validação da disponibilidade.

Add WhatsApp / phone fallback in the sidebar
For rural accommodation, many people will want quick reassurance. Add:
“Falar por WhatsApp”
“Ligar”
“Enviar email”
--> make this clear that the contacto page will let you also talk via WhatsApp

Reduce required guest names at first
Requiring every guest’s full name before reservation confirmation can create friction. Better flow:
reservation request: responsible person + number of guests
after confirmation: full guest identification

Typo fixes
I noticed:
“preapar” → “preparar”
“horário extraordinários” → “horários extraordinários”
“Conta para a transferência” maybe better as “dados para transferência”
--> generally control all the typos in pt.json and make sure the html pages match that file too.

## Small additions to not forget
Change default language based on browser defaults

404.thml