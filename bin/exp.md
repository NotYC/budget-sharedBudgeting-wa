# Open Endpoints:

___

## sign-in packet(public):

    firstname: str
    lastname: str
    identifier: str(email) or num(phone)
    pass: str

### sign-in landing(backend): 
>http://`<hostip>`:8001/auth/signup
### sign-in landing(dataLink): 
>http://`<hostip>`:8002/user/signup
___

## log-in packet(public):

    identifier: str(email) or num(phone)
    pass: str

### log-in landing(backend): 
http://`<hostip>`:8001/auth/login
### log-in landing(dataLink): 
http://`<hostip>`:8002/user/login

---

## log-out packet(protected)


      no active data(get)
      cookies: 
         irevsl_gbxra

### log-out landing(backend):


---




### Other Things :
1. encoder used for general purpose: ROT 13 
    1. verify_toker : irevsl_gbxra
    2. firstname : svefganzr
    3. lastname : ynfganzr

