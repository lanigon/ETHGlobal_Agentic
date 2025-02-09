"""Main Streamlit application for credential management."""

import uuid
import pandas as pd
from typing import Dict, List

from nillion_pack.config import NODE_CONFIG, SCHEMA_ID, NUM_NODES
import nillion_pack.generate_tokens as generate_tokens
from nillion_pack.nildb_api import NilDBAPI
from nillion_pack.encryption import DataEncryption

# Initialize services
nildb_api = NilDBAPI(NODE_CONFIG)
encryption = DataEncryption(NUM_NODES)

def upload_user_bottle_credentials(user_id: str, title: str, bottle_content: str) -> bool:
    """Create and store encrypted credentials across nodes."""
    try:
        # Generate unique ID
        cred_id = str(uuid.uuid4())

        # Encrypt the content into shares
        encrypted_shares = encryption.encrypt_password(bottle_content)
        
        # Store shares across nodes
        success = True
        for i, node_name in enumerate(['node_a', 'node_b', 'node_c']):
            credentials_data = {
                    "_id": cred_id,
                    "user_id": user_id,
                    "title": title,
                    "bottle_content": encrypted_shares[i]
            }
            if not nildb_api.data_upload(node_name, SCHEMA_ID, [credentials_data]):
                success = False
                break
                
        return success
    except Exception as e:
        # st.error(f"Error creating credentials: {str(e)}")
        print(f"Error creating credentials: {str(e)}")
        return False

def fetch_credentials() -> List[Dict]:
    """Fetch and decrypt credentials from nodes."""
    try:
        # Fetch from all nodes
        credentials = {}
        for node_name in ['node_a', 'node_b', 'node_c']:
            node_creds = nildb_api.data_read(node_name, SCHEMA_ID)
            # print('node_creds', node_creds)
            for cred in node_creds:
                cred_id = cred['_id']
                if cred_id not in credentials:
                    credentials[cred_id] = {
                        'user_id': cred['user_id'],
                        'title': cred['title'],
                        'shares': []
                    }
                credentials[cred_id]['shares'].append(cred['bottle_content'])
        
        # Decrypt password
        decrypted_creds = []
        for cred_id, cred_data in credentials.items():
            if len(cred_data['shares']) == NUM_NODES:
                try:
                    bottle_content = encryption.decrypt_password(cred_data['shares'])
                    decrypted_creds.append({
                        'user_id': cred_data['user_id'],
                        'title': cred_data['title'],
                        'bottle_content': bottle_content
                    })
                except Exception as e:
                    # st.warning(f"Could not decrypt credentials {cred_id}: {str(e)}")
                    print(f"Could not decrypt credentials {cred_id}: {str(e)}")
        return decrypted_creds
    except Exception as e:
        # st.error(f"Error fetching credentials: {str(e)}")
        print(f"Error fetching credentials: {str(e)}")
        return []
    

if __name__ == '__main__':
    # generate_tokens.update_config()
    # upload_user_bottle_credentials(user_id="0xfA5aC709311146dA718B3fba0a90A3Bd96e7a472", title="When a Dream Ends", bottle_content="I thought it wouldn’t hurt this much. I told myself I was prepared, that I had always known the truth deep down. That he never saw me the way I saw him. But knowing something and feeling it are two different things. I saw him today—with her. They weren’t even trying to hide it. The way he looked at her, the way she laughed at something he said, the way their hands brushed and neither of them pulled away. It was so natural, so effortless. And I just stood there, watching a dream I never even had the courage to chase slip through my fingers. I wanted to be angry, but there’s no one to blame. He never made promises, never led me on. He was just being himself, while I was the one who built a fantasy out of stolen glances and wishful thinking. Maybe this is for the best. Maybe now I can finally stop hoping, stop waiting for something that was never meant to be.")
    # upload_user_bottle_credentials(user_id="0xfA5aC709311146dA718B3fba0a90A3Bd96e7a472", title="A Secret I Can’t Tell", bottle_content="I wish I could say it out loud. Just once. Just to see what it feels like, to have the words leave my lips instead of circling endlessly in my mind. But every time I think about it, my throat tightens, and the words disappear before they even reach the surface. I like him. No—I think I might love him. That thought alone terrifies me. I don’t even know when it started. Maybe it was the way he laughs, like he isn’t just amused but truly happy. Or the way he pushes his hair back when he’s thinking, completely unaware of how effortlessly charming he looks. It’s stupid, isn’t it? That something so small, so ordinary, could make my heart race.")

    generate_tokens.update_config()
    decrypted_creds = fetch_credentials()
    print(decrypted_creds)