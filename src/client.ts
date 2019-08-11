import {
  CommandClient,
  CommandClientOptions,
  CommandClientRunOptions,
} from 'detritus-client';


export interface MuckManOptions extends CommandClientOptions {
  directory: string, 
  directoryIsAbsolute?: boolean,
}

export interface MuckManRunOptions extends CommandClientRunOptions {
  directory?: string,
  directoryIsAbsolute?: boolean,
}

export class MuckMan extends CommandClient {
  directory?: string;
  directoryIsAbsolute: boolean = false;

  constructor(
    options: MuckManOptions,
    token?: string,
  ) {
    super(token || '', options);

    if (options.directory) {
      this.directory = options.directory;
      this.directoryIsAbsolute = !!options.directoryIsAbsolute;
    }
  }

  async resetCommands(): Promise<void> {
    this.clear();
    if (this.directory) {
      await this.addMultipleIn(this.directory, this.directoryIsAbsolute);
    }
  }

  async run(options: MuckManRunOptions = {}) {
    this.directory = options.directory || this.directory;
    if (options.directoryIsAbsolute !== undefined) {
      this.directoryIsAbsolute = !!options.directoryIsAbsolute;
    }
    if (this.directory) {
      await this.addMultipleIn(this.directory, this.directoryIsAbsolute);
    }
    return super.run(options);
  }
}
