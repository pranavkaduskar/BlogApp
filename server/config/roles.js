const AccessControl = require('accesscontrol');
const { Article } = require('../models/article_model');

let grantsObject ={
    admin:{
        profile:{
            'create:any': ['*'],
            'read:any':['*'],
            'update:any':['*'],
            'delete:any':['*']
        },
        articles:{
            'read:any':['*']
        },
        article:{
            'create:any': ['*'],
            'read:any':['*'],
            'update:any':['*'],
            'delete:any':['*']

        }
    },
    user:{
        profile:{
            
            // 'read:own':['*', '!password', '!_id','!date'], //if we not want to show password and id etc use this format.
            'read:own':['*'],
            'update:own':['*'],
        }
    },
    gest:{
        
    }


}

const roles = new AccessControl(grantsObject);

module.exports = {roles}