import { useMutation } from '@tanstack/react-query';
import type { ApiType } from 'api';
import { hc } from 'hono/client';
import { useState } from 'react';

const client = hc<ApiType>('http://localhost:3001/');

const App = () => {
  const [url, setUrl] = useState('');
  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await client.test.beautifyDomByUrl.$get({
        query: {
          url,
        },
      });
      const json = await res.json();
      return json;
    },
  });

  return (
    <div className="h-screen w-screen flex flex-col gap-2 p-2">
      <div className="flex justify-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(url);
          }}
        >
          <div className="join">
            <div>
              <label className="input validator join-item">
                <input
                  type="url"
                  placeholder="https://"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </label>
              <div className="validator-hint hidden">Enter a valid URL</div>
            </div>
            <button type="submit" className="btn btn-neutral join-item">
              Submit
            </button>
          </div>
        </form>
      </div>
      <div className="flex-1 h-0 overflow-y-auto">
        <div
          className="prose lg:prose-xl mx-auto"
          dangerouslySetInnerHTML={{
            __html: mutation.data?.content || '',
          }}
        ></div>
      </div>
    </div>
  );
};

export default App;
