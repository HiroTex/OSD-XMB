//////////////////////////////////////////////////////////////////////////
///*				   			 THREAD								  *///
/// 				   		  										   ///
///		    This will handle all thread-related work operations.	   ///
/// 				   		  										   ///
//////////////////////////////////////////////////////////////////////////

const MainMutex = new Mutex();

const Tasks = (() => {
    const queue = [];
    let isRunning = false;

    return {
        Push: function (fun) {
            queue.push(() => {
                MainMutex.lock();
                try {
                    fun();
                } catch (e) {
                    xlog(e);
                } finally {
                    isRunning = false;
                    MainMutex.unlock();
                }
            });
        },

        Process: function () {
            if (isRunning || queue.length === 0) return;
            isRunning = true;
            const fun = queue.shift();
            Threads.new(fun).start();
        },

        get isRunning() { return isRunning; }
    };
})();
