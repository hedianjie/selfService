        // 增
        // return await db.insert('posts', { title: 'Hello World' });

        // 改
        // 第一种
        // const row = {
        //     id: 123,
        //     name: 'fengmk2',
        //     otherField: 'other field value',    // any other fields u want to update
        //     modifiedAt: db.now, // `now()` on db server
        //   };
        // return await db.update('posts', row);
        
        // 第二种
        //   const row = {
        //     name: 'fengmk2',
        //     otherField: 'other field value',    // any other fields u want to update
        //     modifiedAt: db.now, // `now()` on db server
        //   };
        
        //   const options = {
        //     where: {
        //       custom_id: 456
        //     }
        //   };
        //   return await db.update('posts', row, options);
        

        // 查
        // 第一种
        // return await db.select.get('users', { id: 11 });

        // 第二种
        // return await db.select('user', {
        //     where: {
        //         name: 'hedianjie666',
        //         pwd: ['qwer', 'ewqq'],
        //     },
        //     columns: ['id', 'name', 'is_enable'],
        //     orders: {
        //         date_time: 'asc',
        //         is_enable: 'asc'
        //     },
        //     limit: 2,
        //     offset: 2
        // });

        // 删
        // return await db.delete('user', {
        //     id: 291,
        // })

        
        // 直接用sql语句
        
        /**
         * 第一种
         * return await db.query('INSERT INTO user(name,pwd,is_enable) VALUES ?', [param])
         */

        /**
         * 第二种
         * return await db.query([
         * 
         * {sql: 'INSERT INTO user(name,pwd,is_enable) VALUES ?', values: [param]}
         * {sql: 'INSERT INTO user(name,pwd,is_enable) VALUES ?', values: [param]}
         * function return {sql: 'INSERT INTO user(name,pwd,is_enable) VALUES ?', values: [param]}
         * 
         * ])
         */

         /**
          * 第三种
         * return await db.query('INSERT INTO user(name,pwd,is_enable) VALUES ?', [param])
         *              .next('INSERT INTO user(name,pwd,is_enable) VALUES ?', [param])
         *              .next([
         *                  {sql: 'INSERT INTO user(name,pwd,is_enable) VALUES ?', values: [param]},
         *                  {sql: 'INSERT INTO user(name,pwd,is_enable) VALUES ?', values: [param]}
         *              ])
         *              .next(function return {sql: 'INSERT INTO user(name,pwd,is_enable) VALUES ?', values: [param]})
         *              
         * 
         */ 