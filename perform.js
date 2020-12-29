const fs = require('fs');
const readline = require('readline');

//This class creates a file-bassed database.
class DataBase{
    FileBaseDatabase;
    filePath = __dirname + "/mydata";
    valueLimit;
    fileSize;
    keyLimit;
    database;
    constructor(dataBaseName, _filepath) {
        this.FileBaseDatabase = dataBaseName + ".json";
        if (_filepath && _filepath.lenght > 0) {
            this.filePath = _filepath;
        }
        this.valueLimit = 16 * 1000; //16kb
        this.fileSize = 1000000;//1gb;
        this.keyLimit = 32;
        this.InitializeDatabase(this.filePath);
         this.LoadDataBaseFile();
        
    }

    //Initialize the file and directory.
    InitializeDatabase = (_path) => {
        try {
            this.setDatabaseDirctory(_path);
            this.createDataBase();
        } catch (error) {
            throw error;
        }
        return 0;
    }
    
    setDatabaseDirctory = (_filepath) => {
        if (_filepath.lenght > 0) {
            this.filePath = _filepath;
        }
        return 1;
    }
    
    //Load the database file.
    LoadDataBaseFile = () => {
        try {
            this.database = require(`${this.filePath}/${this.FileBaseDatabase}`);
        } catch (error) {
            throw error;
        }
        return 1;
    }
    createDataBase = () => {

    //create directory
        fs.mkdir(this.filePath, { recursive: true }, (err) => {
        if (err) throw err;
    });

    //create file.
        fs.writeFileSync(`${this.filePath}/${this.FileBaseDatabase}`,JSON.stringify({}), function (err) {
        if (err) throw err;
        }); 
        return 1;

}
    
    Error = (message) => {
        console.log(message);
        return 1;
    }


    isExpired =(time, key)=>{
        
        let expired = (time != 0 && time < (new Date().getTime()));
        if (expired) {
            delete this.database[key];
            this.Error(`The time to live of the key ${key} has expired`);
        }
        return expired;
    }

    //create method.
     Create =(key, value, timeout = 0) => {

    // check if key is valid.
    if (key.lenght > this.keyLimit) {
        Error("Key must be less than 32 character!");
        return 0;
    }
     //check if value is valid.
     if (value.lenght > this.valueLimit) {
         Error("value must be less than 16KB!")
         return 0;
    }

    // if the file limit
    if (Object.keys(this.database).length >= this.fileSize) {
        Error("Excceeded the file limit.");
        return 0;
    }


    // if already exists or not expired:
    if (this.database.hasOwnProperty(key)) {
       let expired = this.isExpired(this.database[key][key]["timeout"], key);
        if (expired) {
            console.log('  Creating new one...');
        }
        else {
            console.log('The key already exits.');
            return 0;
        }
    }
    
    //convert in milliseconds.
    timeout = timeout == 0 ? 0 : timeout*1000 + ((new Date().getTime()));
    
    let temp = {};
    temp[key] = { value: value, timeout: timeout };
        this.database[key] = temp
    fs.writeFileSync(`${this.filePath}/${this.FileBaseDatabase}`, JSON.stringify(this.database));
         console.log('The data create successfully.')
    return { "status": 200 };
    
}

    //Read the key from databases.
   Read = (key) => {
    if (!this.database.hasOwnProperty(key)) {
        Error("The key doesn't exist. Please enter a valid key");
        return{"status":404, "msg":"The key doesn't exist"};
    }
    
    const ValueObject = this.database[key][key];
    const value = ValueObject["timeout"];    

    if (this.isExpired(value, key)) {
        return{"status":401, "msg":"The time to live for key is expired."};
    }

       return {
        "status":200,
        value: ValueObject["value"],
        time_to_live: value == 0 ? "infinete" : value
    };

}

//delete the data with given key.
Delete = (key) => {
    if (!this.database.hasOwnProperty(key)) {
        Error("The key doesn't exist. Please enter a valid key");
        return {"status":404, "msg":"The key doesn't exist"};
    }
    else if (this.isExpired(this.database[key][key]["timeout"], key)) {
        return{"status":401, "msg":"The time to live for key is expired."};;
    }
    else {
        delete this.database[key];
        fs.writeFileSync(`${this.filePath}/${this.FileBaseDatabase}`, JSON.stringify(this.database));
        console.log(`The key: ${key} is deleted successfully.`);
        return {"status":200}
    }

    }
   
}

module.exports = DataBase